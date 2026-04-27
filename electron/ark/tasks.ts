import type {
  AssetSource,
  GenerationMode,
  GenerationParams,
  SubmitTaskInput
} from '@shared/types'
import type { ArkContentItem, ArkImageRole, ArkSubmitPayload } from './types'
import { fileToDataUri } from './encode'

const ORDER: Record<GenerationMode, string> = {
  'text-to-video': 'text-only',
  'image-to-video': 'text + image',
  'first-last-frame': 'text + first image + last image',
  'multi-reference': 'text + multi ref'
}

export async function buildPayload(input: SubmitTaskInput): Promise<ArkSubmitPayload> {
  const { prompt, assets, params, mode } = input

  validateByMode(mode, assets)

  const content: ArkContentItem[] = []
  if (prompt.trim()) content.push({ type: 'text', text: prompt.trim() })

  let imageIndex = 0
  for (const asset of assets) {
    const url = await resolveAssetUrl(asset)
    if (asset.kind === 'image') {
      content.push({ type: 'image_url', image_url: { url }, role: imageRoleFor(mode, imageIndex) })
      imageIndex++
    } else if (asset.kind === 'video') {
      content.push({ type: 'video_url', video_url: { url }, role: 'reference_video' })
    } else {
      content.push({ type: 'audio_url', audio_url: { url }, role: 'reference_audio' })
    }
  }

  const payload: ArkSubmitPayload = {
    model: params.model,
    content,
    resolution: params.resolution,
    ratio: params.ratio,
    duration: params.duration,
    watermark: params.watermark,
    generate_audio: params.generateAudio,
    return_last_frame: params.returnLastFrame
  }
  if (typeof params.seed === 'number') payload.seed = params.seed
  return payload
}

async function resolveAssetUrl(asset: AssetSource): Promise<string> {
  if (asset.mode === 'url') return asset.url
  return fileToDataUri(asset.path)
}

function imageRoleFor(mode: GenerationMode, index: number): ArkImageRole {
  if (mode === 'first-last-frame') return index === 0 ? 'first_frame' : 'last_frame'
  if (mode === 'image-to-video') return 'first_frame'
  return 'reference_image'
}

function validateByMode(mode: GenerationMode, assets: AssetSource[]) {
  const imgs = assets.filter(a => a.kind === 'image').length
  const vids = assets.filter(a => a.kind === 'video').length
  const auds = assets.filter(a => a.kind === 'audio').length

  if (imgs > 9) throw new Error('图片最多 9 张')
  if (vids > 3) throw new Error('视频参考最多 3 段')
  if (auds > 3) throw new Error('音频参考最多 3 段')

  if (mode === 'text-to-video' && (imgs || vids || auds)) {
    throw new Error(`文生视频不接受素材（当前 ${ORDER[mode]}）`)
  }
  if (mode === 'image-to-video' && imgs !== 1) {
    throw new Error('图生视频需要且仅需要 1 张参考图')
  }
  if (mode === 'first-last-frame' && imgs !== 2) {
    throw new Error('首尾帧需要 2 张图（首帧在前、尾帧在后）')
  }
}
