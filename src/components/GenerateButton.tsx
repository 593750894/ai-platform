import { useState } from 'react'
import { Sparkles, AlertTriangle, X } from 'lucide-react'
import type { GenerationMode } from '@shared/types'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/cn'

interface Props {
  mode: GenerationMode
  canSubmit: boolean
  requireHint?: string
}

export default function GenerateButton({ mode, canSubmit, requireHint }: Props) {
  const form = useAppStore((s) => s.forms[mode])
  const apiStatus = useAppStore((s) => s.apiStatus)
  const hasApi = !!apiStatus?.ark.hasKey
  const disabled = !hasApi || !canSubmit
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onClick = async () => {
    if (disabled) return
    setSubmitError(null)
    const res = await window.seedland.submitTask({
      mode,
      prompt: form.prompt,
      assets: form.assets,
      params: form.params
    })
    if ('error' in res) setSubmitError(res.error)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button onClick={onClick} disabled={disabled} className={cn('btn-primary flex-1 h-12 text-[15px]')}>
          <Sparkles className="h-4 w-4" />
          {hasApi ? '生成视频' : '未配置 ARK Key'}
          {canSubmit && hasApi && (
            <span className="absolute inset-0 rounded-xl bg-accent-gradient opacity-0 hover:opacity-30 blur-xl transition-opacity pointer-events-none" />
          )}
        </button>
        {requireHint && !canSubmit && (
          <span className="text-xs text-text-muted max-w-[180px]">{requireHint}</span>
        )}
      </div>
      {submitError && (
        <div className="flex items-start gap-2 rounded-lg border border-neon-rose/30 bg-neon-rose/5 px-3 py-2 text-xs text-neon-rose">
          <AlertTriangle className="mt-[2px] h-3.5 w-3.5 flex-shrink-0" />
          <span className="flex-1 break-words">{submitError}</span>
          <button
            onClick={() => setSubmitError(null)}
            className="text-neon-rose/60 hover:text-neon-rose"
            aria-label="关闭"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
