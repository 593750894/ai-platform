import { Film, Image as ImageIcon, Layers, Wand2 } from 'lucide-react'
import type { GenerationMode } from '@shared/types'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/cn'

interface ModeDef {
  id: GenerationMode
  label: string
  subtitle: string
  icon: typeof Film
}

const MODES: ModeDef[] = [
  { id: 'text-to-video', label: '文生视频', subtitle: 'Text to Video', icon: Wand2 },
  { id: 'image-to-video', label: '图生视频', subtitle: 'Image to Video', icon: ImageIcon },
  { id: 'first-last-frame', label: '首尾帧', subtitle: 'First & Last', icon: Film },
  { id: 'multi-reference', label: '多模态参考', subtitle: 'Multi Reference', icon: Layers }
]

export default function Sidebar() {
  const mode = useAppStore((s) => s.currentMode)
  const setMode = useAppStore((s) => s.setMode)

  return (
    <aside className="flex w-56 flex-col border-r border-[rgba(0,229,255,0.08)] px-3 py-5">
      <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-dim">
        Generate
      </div>
      <nav className="flex flex-col gap-1">
        {MODES.map(({ id, label, subtitle, icon: Icon }) => {
          const active = mode === id
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150',
                active
                  ? 'bg-[rgba(0,229,255,0.06)] shadow-[inset_0_0_0_1px_rgba(0,229,255,0.25)]'
                  : 'hover:bg-[rgba(255,255,255,0.02)]'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-gradient shadow-glow" />
              )}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  active
                    ? 'bg-[rgba(0,229,255,0.12)] text-neon-cyan'
                    : 'bg-[rgba(255,255,255,0.02)] text-text-muted group-hover:text-text'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    'text-sm font-medium',
                    active ? 'text-text' : 'text-text-muted group-hover:text-text'
                  )}
                >
                  {label}
                </span>
                <span className="truncate text-[10px] font-mono tracking-wide text-text-dim">
                  {subtitle}
                </span>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-3 pb-1">
        <div className="rounded-lg border border-[rgba(138,148,184,0.08)] bg-[rgba(7,11,20,0.4)] p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-dim mb-1">Powered by</div>
          <div className="text-xs font-medium text-text">火山方舟 · Seedance 2.0</div>
          <div className="mt-1 text-[10px] text-text-dim font-mono">
            Doubao Seedance Family
          </div>
        </div>
      </div>
    </aside>
  )
}
