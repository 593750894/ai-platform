import { app, BrowserWindow, ipcMain, dialog, shell, session } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import type { ApiStatus, SubmitTaskInput, TaskRecord } from '@shared/types'
import { arkSubmit, ArkError } from './ark/client'
import { buildPayload } from './ark/tasks'
import { pollUntilDone } from './ark/poller'
import { fileStats } from './ark/encode'
import { translateArkError } from './ark/errors'

// Load .env from project root (dev) or resources (packaged)
function loadEnv() {
  const candidates = is.dev
    ? [path.join(process.cwd(), '.env'), path.join(app.getAppPath(), '.env')]
    : [
        path.join(path.dirname(app.getPath('exe')), '.env'),
        path.join(process.resourcesPath, '.env')
      ]
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p })
      return
    }
  }
}

let mainWindow: BrowserWindow | null = null
const tasks = new Map<string, TaskRecord>()
const controllers = new Map<string, AbortController>()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: 'SeedLand · V',
    backgroundColor: '#070B14',
    titleBarStyle: 'hiddenInset',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  loadEnv()
  electronApp.setAppUserModelId('com.seedland.seedlandv')
  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w))
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function broadcastTask(task: TaskRecord) {
  mainWindow?.webContents.send('task:update', task)
}

function updateTask(localId: string, patch: Partial<TaskRecord>) {
  const prev = tasks.get(localId)
  if (!prev) return
  const next = { ...prev, ...patch, updatedAt: Date.now() }
  tasks.set(localId, next)
  broadcastTask(next)
}

function registerIpc() {
  ipcMain.handle('api:status', (): ApiStatus => ({
    ark: { hasKey: !!process.env.VOLC_ARK_API_KEY }
  }))

  ipcMain.handle('api:listTasks', () => Array.from(tasks.values()).sort((a, b) => b.createdAt - a.createdAt))

  ipcMain.handle('api:clearTasks', () => {
    for (const [, c] of controllers) c.abort()
    controllers.clear()
    tasks.clear()
  })

  ipcMain.handle('api:cancel', (_e, localId: string) => {
    controllers.get(localId)?.abort()
    updateTask(localId, { status: 'cancelled' })
  })

  ipcMain.handle('api:removeTask', (_e, localId: string) => {
    controllers.get(localId)?.abort()
    controllers.delete(localId)
    tasks.delete(localId)
  })

  ipcMain.handle(
    'api:pickFile',
    async (_e, kind: 'image' | 'video' | 'audio', allowedExts?: string[]) => {
      const defaults: Record<'image' | 'video' | 'audio', { name: string; exts: string[] }> = {
        image: { name: 'Images', exts: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] },
        video: { name: 'Videos', exts: ['mp4', 'mov', 'webm', 'mkv'] },
        audio: { name: 'Audio', exts: ['mp3', 'wav', 'm4a', 'aac'] }
      }
      const d = defaults[kind]
      const filters = [
        { name: d.name, extensions: allowedExts && allowedExts.length ? allowedExts : d.exts }
      ]
      const res = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters
      })
      if (res.canceled || !res.filePaths[0]) return null
      const p = res.filePaths[0]
      const stats = await fileStats(p)
      return { path: p, name: path.basename(p), sizeBytes: stats.sizeBytes }
    }
  )

  ipcMain.handle('api:downloadVideo', async (_e, url: string, suggestedName: string) => {
    const res = await dialog.showSaveDialog({
      defaultPath: suggestedName,
      filters: [{ name: 'MP4', extensions: ['mp4'] }]
    })
    if (res.canceled || !res.filePath) return null

    const savePath = res.filePath
    const win = mainWindow
    if (!win) return null

    return new Promise<string | null>((resolve) => {
      session.defaultSession.once('will-download', (_ev, item) => {
        item.setSavePath(savePath)
        item.once('done', (_e2, state) => resolve(state === 'completed' ? savePath : null))
      })
      win.webContents.downloadURL(url)
    })
  })

  ipcMain.handle('api:openExternal', (_e, url: string) => shell.openExternal(url))

  ipcMain.handle('api:submit', async (_e, input: SubmitTaskInput) => {
    if (!process.env.VOLC_ARK_API_KEY) {
      return { error: '未配置 VOLC_ARK_API_KEY（Seedance 2.0 需要 Ark API Key）' }
    }

    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const now = Date.now()
    const record: TaskRecord = {
      id: '',
      localId,
      mode: input.mode,
      prompt: input.prompt,
      params: input.params,
      assetsPreview: input.assets.map(a => ({
        kind: a.kind,
        label: a.mode === 'url' ? a.url : (a as { name: string }).name
      })),
      status: 'submitting',
      createdAt: now,
      updatedAt: now
    }
    tasks.set(localId, record)
    broadcastTask(record)

    const ctrl = new AbortController()
    controllers.set(localId, ctrl)

    try {
      const payload = await buildPayload(input)
      const { id } = await arkSubmit(payload)
      updateTask(localId, { id, status: 'queued' })
      pollUntilDone(id, {
        signal: ctrl.signal,
        onUpdate: (snap) => {
          updateTask(localId, {
            status: snap.status as TaskRecord['status'],
            videoUrl: snap.content?.video_url,
            lastFrameUrl: snap.content?.last_frame_url,
            usage: snap.usage
          })
        }
      })
        .then((final) => {
          controllers.delete(localId)
          if (final.status === 'failed') {
            const zh = translateArkError(0, final.error, final.error?.message)
            updateTask(localId, {
              status: 'failed',
              error: { message: zh, raw: JSON.stringify(final) }
            })
          } else {
            updateTask(localId, {
              status: final.status as TaskRecord['status'],
              videoUrl: final.content?.video_url,
              lastFrameUrl: final.content?.last_frame_url,
              usage: final.usage
            })
          }
        })
        .catch(handleBackgroundError(localId))
      return { localId }
    } catch (err) {
      controllers.delete(localId)
      const msg = err instanceof Error ? err.message : String(err)
      const raw = err instanceof ArkError ? err.raw : undefined
      updateTask(localId, { status: 'failed', error: { message: msg, raw } })
      return { error: msg }
    }
  })
}

function handleBackgroundError(localId: string) {
  return (err: unknown) => {
    controllers.delete(localId)
    const current = tasks.get(localId)
    if (current?.status === 'cancelled') return
    const raw = err instanceof ArkError ? err.raw : undefined
    const msg = err instanceof Error ? err.message : String(err)
    updateTask(localId, { status: 'failed', error: { message: msg, raw } })
  }
}
