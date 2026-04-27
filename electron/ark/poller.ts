import { arkGetTask, ArkError } from './client'
import type { ArkTaskResponse } from './types'

export interface PollOptions {
  initialDelayMs?: number
  maxDelayMs?: number
  timeoutMs?: number
  signal?: AbortSignal
  onUpdate?: (snapshot: ArkTaskResponse) => void
}

export async function pollUntilDone(
  taskId: string,
  opts: PollOptions = {}
): Promise<ArkTaskResponse> {
  const initial = opts.initialDelayMs ?? 3000
  const max = opts.maxDelayMs ?? 10000
  const timeout = opts.timeoutMs ?? 15 * 60 * 1000
  const started = Date.now()
  let delay = initial

  while (true) {
    if (opts.signal?.aborted) throw new ArkError('已取消', 0)
    if (Date.now() - started > timeout) throw new ArkError('轮询超时', 0)
    await sleep(delay, opts.signal)

    try {
      const snap = await arkGetTask(taskId)
      const elapsed = Math.floor((Date.now() - started) / 1000)
      console.log(`[ark.poll] ${taskId} status=${snap.status} elapsed=${elapsed}s`)
      opts.onUpdate?.(snap)
      if (
        snap.status === 'succeeded' ||
        snap.status === 'failed' ||
        snap.status === 'cancelled' ||
        snap.status === 'expired'
      ) {
        return snap
      }
    } catch (e) {
      if (e instanceof ArkError && e.status >= 500) {
        console.warn(`[ark.poll] ${taskId} transient ${e.status}: ${e.message}`)
      } else {
        console.error(`[ark.poll] ${taskId} fatal:`, e)
        throw e
      }
    }

    delay = Math.min(Math.floor(delay * 1.3), max)
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new ArkError('已取消', 0))
    })
  })
}
