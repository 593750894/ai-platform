import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { SubmitTaskInput, TaskRecord, AssetKind } from './shared/types'

const api = {
  getApiStatus: () => ipcRenderer.invoke('api:status'),
  submitTask: (input: SubmitTaskInput) => ipcRenderer.invoke('api:submit', input),
  cancelTask: (localId: string) => ipcRenderer.invoke('api:cancel', localId),
  removeTask: (localId: string) => ipcRenderer.invoke('api:removeTask', localId),
  listTasks: () => ipcRenderer.invoke('api:listTasks'),
  clearTasks: () => ipcRenderer.invoke('api:clearTasks'),
  pickFile: (kind: AssetKind, allowedExts?: string[]) =>
    ipcRenderer.invoke('api:pickFile', kind, allowedExts),
  getDroppedPath: (file: File) => webUtils.getPathForFile(file),
  downloadVideo: (url: string, suggestedName: string) =>
    ipcRenderer.invoke('api:downloadVideo', url, suggestedName),
  openExternal: (url: string) => ipcRenderer.invoke('api:openExternal', url),
  onTaskUpdate: (cb: (task: TaskRecord) => void) => {
    const listener = (_: unknown, task: TaskRecord) => cb(task)
    ipcRenderer.on('task:update', listener)
    return () => ipcRenderer.removeListener('task:update', listener)
  }
}

contextBridge.exposeInMainWorld('seedland', api)
