import ModeHeader from './ModeHeader'
import PromptPanel from '@/components/PromptPanel'
import ParamsPanel from '@/components/params/ParamsPanel'
import AssetPicker from '@/components/asset/AssetPicker'
import GenerateButton from '@/components/GenerateButton'
import { useAppStore } from '@/lib/store'

const MODE = 'multi-reference' as const

export default function MultiReference() {
  const form = useAppStore((s) => s.forms[MODE])
  const canSubmit = form.prompt.trim().length > 0

  return (
    <div className="space-y-5">
      <ModeHeader
        title="多模态参考"
        subtitle="Multi-Reference (image + video + audio)"
        description="同时参考图片、视频、音频，最灵活的玩法。最多 9 图 + 3 视频 + 3 音频。"
      />
      <PromptPanel
        mode={MODE}
        placeholder="描述你想要的画面和动作，例如：参考第一张图的人物，第二张图的服饰，第三张图的场景…"
      />
      <AssetPicker
        mode={MODE}
        kinds={['image', 'video', 'audio']}
        max={15}
        hint="图片≤9 · 视频≤3 · 音频≤3"
      />
      <ParamsPanel mode={MODE} />
      <GenerateButton mode={MODE} canSubmit={canSubmit} requireHint="至少需要提示词" />
    </div>
  )
}
