import type { GenerationMode } from '@shared/types'
import { useAppStore } from '@/lib/store'

interface Props {
  mode: GenerationMode
  placeholder?: string
  minRows?: number
}

export default function PromptPanel({ mode, placeholder, minRows = 4 }: Props) {
  const prompt = useAppStore((s) => s.forms[mode].prompt)
  const setPrompt = useAppStore((s) => s.setPrompt)

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <label className="field-label !mb-0">提示词</label>
        <span className="text-[11px] font-mono text-text-dim">{prompt.length} chars</span>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(mode, e.target.value)}
        rows={minRows}
        placeholder={placeholder ?? '描述你想生成的画面，例如：一只橘猫在霓虹雨夜的东京街头漫步，电影感，超写实'}
        className="input-base resize-none text-sm leading-relaxed"
      />
    </section>
  )
}
