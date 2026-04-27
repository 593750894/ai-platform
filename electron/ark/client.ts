import type { ArkSubmitPayload, ArkSubmitResponse, ArkTaskResponse } from './types'
import { parseArkErrorBody, translateArkError } from './errors'

const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3'

export class ArkError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly raw?: string,
    public readonly code?: string
  ) {
    super(message)
  }
}

function getKey(): string {
  const k = process.env.VOLC_ARK_API_KEY
  if (!k) throw new ArkError('未配置 VOLC_ARK_API_KEY（请在项目根目录 .env 中填写）', 0)
  return k
}

export async function arkSubmit(payload: ArkSubmitPayload): Promise<ArkSubmitResponse> {
  const res = await fetch(`${ARK_BASE}/contents/generations/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getKey()}`
    },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  if (!res.ok) {
    const err = parseArkErrorBody(text)
    throw new ArkError(translateArkError(res.status, err), res.status, text, err?.code)
  }
  try {
    const data = JSON.parse(text) as ArkSubmitResponse
    if (!data.id) throw new ArkError('接口响应缺少任务 id 字段', res.status, text)
    return data
  } catch {
    throw new ArkError('接口响应解析失败', res.status, text)
  }
}

export async function arkGetTask(taskId: string): Promise<ArkTaskResponse> {
  const res = await fetch(`${ARK_BASE}/contents/generations/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${getKey()}` }
  })
  const text = await res.text()
  if (!res.ok) {
    const err = parseArkErrorBody(text)
    throw new ArkError(translateArkError(res.status, err), res.status, text, err?.code)
  }
  return JSON.parse(text) as ArkTaskResponse
}
