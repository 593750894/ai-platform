import { useState } from 'react'
import { ChevronDown, Sliders } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GenerationMode, Ratio } from '@shared/types'
import { resolutionsOf } from '@shared/types'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/cn'

const RATIOS: Ratio[] = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9', 'adaptive']
const DURATION_MIN = 4
const DURATION_MAX = 15

interface Props {
  mode: GenerationMode
}

export default function ParamsPanel({ mode }: Props) {
  const form = useAppStore((s) => s.forms[mode])
  const setResolution = useAppStore((s) => s.setResolution)
  const setRatio = useAppStore((s) => s.setRatio)
  const setDuration = useAppStore((s) => s.setDuration)
  const setParams = useAppStore((s) => s.setParams)
  const [advOpen, setAdvOpen] = useState(false)

  const { model, resolution, ratio, duration, watermark, generateAudio, returnLastFrame, seed } =
    form.params
  const resolutions = resolutionsOf(model)

  return (
    <section className="glass rounded-2xl p-5 space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="field-label">分辨率</label>
          <div className="flex gap-1 rounded-lg bg-[rgba(7,11,20,0.5)] p-1 border border-[rgba(138,148,184,0.1)]">
            {resolutions.map((r) => (
              <button
                key={r}
                onClick={() => setResolution(mode, r)}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors',
                  resolution === r
                    ? 'bg-[rgba(0,229,255,0.12)] text-neon-cyan'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="field-label">画面比例</label>
          <div className="grid grid-cols-7 gap-1 rounded-lg bg-[rgba(7,11,20,0.5)] p-1 border border-[rgba(138,148,184,0.1)]">
            {RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => setRatio(mode, r)}
                className={cn(
                  'rounded-md py-1.5 text-[11px] font-medium transition-colors',
                  ratio === r
                    ? 'bg-[rgba(0,229,255,0.12)] text-neon-cyan'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {r === 'adaptive' ? '自适应' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="field-label !mb-0">时长</label>
          <span className="text-sm font-mono text-neon-cyan">{duration}s</span>
        </div>
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={1}
          value={duration}
          onChange={(e) => setDuration(mode, Number(e.target.value))}
          className="seed-slider w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] font-mono text-text-dim">
          <span>{DURATION_MIN}s</span>
          <span>{DURATION_MAX}s</span>
        </div>
      </div>

      <button
        onClick={() => setAdvOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[rgba(138,148,184,0.1)] bg-[rgba(7,11,20,0.3)] px-3 py-2 text-xs text-text-muted hover:text-text hover:border-[rgba(0,229,255,0.2)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5" />
          高级选项
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', advOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {advOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Toggle
                label="生成原生音频"
                desc="generate_audio"
                checked={generateAudio}
                onChange={(v) => setParams(mode, { generateAudio: v })}
              />
              <Toggle
                label="返回尾帧图"
                desc="return_last_frame"
                checked={returnLastFrame}
                onChange={(v) => setParams(mode, { returnLastFrame: v })}
              />
              <Toggle
                label="水印"
                desc="watermark"
                checked={watermark}
                onChange={(v) => setParams(mode, { watermark: v })}
              />
              <div>
                <label className="field-label">Seed</label>
                <input
                  type="number"
                  value={seed ?? ''}
                  onChange={(e) =>
                    setParams(mode, {
                      seed: e.target.value === '' ? undefined : Number(e.target.value)
                    })
                  }
                  placeholder="随机"
                  className="input-base h-9 py-0"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .seed-slider {
          -webkit-appearance: none;
          height: 4px;
          background: linear-gradient(90deg, #00E5FF ${((duration - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100}%, rgba(138,148,184,0.15) ${((duration - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100}%);
          border-radius: 999px;
          outline: none;
        }
        .seed-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #E5ECFF;
          box-shadow: 0 0 0 4px rgba(0,229,255,0.15), 0 0 10px rgba(0,229,255,0.7);
          cursor: pointer;
          transition: box-shadow 0.15s;
        }
        .seed-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(0,229,255,0.2), 0 0 14px rgba(0,229,255,0.9);
        }
      `}</style>
    </section>
  )
}

function Toggle({
  label,
  desc,
  checked,
  onChange
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between rounded-lg border px-3 py-2 transition-colors',
        checked
          ? 'border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.04)]'
          : 'border-[rgba(138,148,184,0.1)] bg-[rgba(7,11,20,0.3)] hover:border-[rgba(138,148,184,0.25)]'
      )}
    >
      <div className="flex flex-col items-start">
        <span className={cn('text-xs font-medium', checked ? 'text-text' : 'text-text-muted')}>
          {label}
        </span>
        <span className="text-[10px] font-mono text-text-dim">{desc}</span>
      </div>
      <div
        className={cn(
          'relative h-4 w-8 rounded-full transition-colors',
          checked ? 'bg-accent-gradient' : 'bg-[rgba(138,148,184,0.2)]'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </div>
    </button>
  )
}
