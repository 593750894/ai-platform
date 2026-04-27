import ModeHeader from './ModeHeader'
import PromptPanel from '@/components/PromptPanel'
import ParamsPanel from '@/components/params/ParamsPanel'
import AssetPicker from '@/components/asset/AssetPicker'
import GenerateButton from '@/components/GenerateButton'
import { useAppStore } from '@/lib/store'

const MODE = 'image-to-video' as const

export default function ImageToVideo() {
  const form = useAppStore((s) => s.forms[MODE])
  const imgs = form.assets.filter((a) => a.kind === 'image').length
  const canSubmit = form.prompt.trim().length > 0 && imgs === 1

  return (
    <div className="space-y-5">
      <ModeHeader
        title="图生视频"
        subtitle="Image to Video"
        description="上传一张参考图 + 文字描述，让画面动起来。"
      />
      <PromptPanel mode={MODE} placeholder="描述参考图应该如何运动，例如：镜头环绕，人物回头微笑" />
      <AssetPicker mode={MODE} kinds={['image']} max={1} hint="只需 1 张参考图" />
      <ParamsPanel mode={MODE} />
      <GenerateButton mode={MODE} canSubmit={canSubmit} requireHint="需要提示词 + 1 张参考图" />
    </div>
  )
}
