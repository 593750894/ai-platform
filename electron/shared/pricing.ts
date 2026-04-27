import type { ModelId, Resolution, TaskRecord } from './types'

interface Rate {
  withVideoInput: number
  withoutVideoInput: number
}

type RateTable = Partial<Record<ModelId, Partial<Record<Resolution, Rate>>>>

// 元 / 百万 tokens. 当某个模型/分辨率没有条目时返回 null —— UI 会仅显示 token 数。
// 来源：火山方舟官方定价页。添加新条目时把来源链接放旁边。
const RATES: RateTable = {
  // Seedance 2.0 — 标准质量
  'doubao-seedance-2-0-260128': {
    '480p': { withVideoInput: 28, withoutVideoInput: 46 },
    '720p': { withVideoInput: 28, withoutVideoInput: 46 },
    '1080p': { withVideoInput: 31, withoutVideoInput: 51 }
  },
  // Seedance 2.0 Fast — 极速出片（仅 480P / 720P）
  'doubao-seedance-2-0-fast-260128': {
    '480p': { withVideoInput: 22, withoutVideoInput: 37 },
    '720p': { withVideoInput: 22, withoutVideoInput: 37 }
  }
}

export interface CostEstimate {
  totalTokens: number
  ratePerMillion: number
  hasVideoInput: boolean
  cny: number
}

export function estimateCost(task: TaskRecord): CostEstimate | null {
  const total = task.usage?.total_tokens
  if (typeof total !== 'number' || total <= 0) return null

  const tier = RATES[task.params.model]?.[task.params.resolution]
  if (!tier) return null

  const hasVideoInput = task.assetsPreview.some((a) => a.kind === 'video')
  const ratePerMillion = hasVideoInput ? tier.withVideoInput : tier.withoutVideoInput
  const cny = (total * ratePerMillion) / 1_000_000
  return { totalTokens: total, ratePerMillion, hasVideoInput, cny }
}

export function formatCNY(cny: number): string {
  return `￥${cny.toFixed(2)}`
}
