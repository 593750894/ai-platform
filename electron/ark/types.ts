export type ArkImageRole = 'first_frame' | 'last_frame' | 'reference_image'
export type ArkVideoRole = 'reference_video'
export type ArkAudioRole = 'reference_audio'

export type ArkContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string }; role?: ArkImageRole }
  | { type: 'video_url'; video_url: { url: string }; role?: ArkVideoRole }
  | { type: 'audio_url'; audio_url: { url: string }; role?: ArkAudioRole }

export interface ArkSubmitPayload {
  model: string
  content: ArkContentItem[]
  resolution?: string
  ratio?: string
  duration?: number
  watermark?: boolean
  generate_audio?: boolean
  return_last_frame?: boolean
  seed?: number
}

export interface ArkSubmitResponse {
  id: string
}

export type ArkTaskStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired'

export interface ArkTaskResponse {
  id: string
  status: ArkTaskStatus
  content?: {
    video_url?: string
    last_frame_url?: string
  }
  usage?: { completion_tokens?: number; total_tokens?: number }
  error?: { code?: string; message?: string }
}
