import { useAppStore } from '@/lib/store'
import { metaOf } from '@shared/types'

interface Props {
  title: string
  subtitle: string
  description: string
}

export default function ModeHeader({ title, subtitle, description }: Props) {
  const model = useAppStore((s) => s.forms['text-to-video'].params.model)
  const meta = metaOf(model)

  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-neon-cyan">
          {subtitle}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(168,85,247,0.25)] bg-[rgba(168,85,247,0.06)] px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neon-violet" />
        <span className="text-[10px] font-mono tracking-wider uppercase text-neon-violet">
          {meta.label} · {meta.sublabel.replace(/^Ark · /, '')} · Ark
        </span>
      </div>
    </div>
  )
}
