import ModeHeader from './ModeHeader'
import PromptPanel from '@/components/PromptPanel'
import ParamsPanel from '@/components/params/ParamsPanel'
import GenerateButton from '@/components/GenerateButton'
import { useAppStore } from '@/lib/store'

const MODE = 'text-to-video' as const

export default function TextToVideo() {
  const prompt = useAppStore((s) => s.forms[MODE].prompt)
  const canSubmit = prompt.trim().length > 0

  return (
    <div className="space-y-5">
      <ModeHeader
        title="文生视频"
        subtitle="Text to Video"
        description="用一段自然语言描述生成 4–15 秒的高质量视频，支持最高 1080p / 原生音频。"
      />
      <PromptPanel mode={MODE} minRows={5} />
      <ParamsPanel mode={MODE} />
      <GenerateButton mode={MODE} canSubmit={canSubmit} requireHint="请先输入提示词" />
    </div>
  )
}
