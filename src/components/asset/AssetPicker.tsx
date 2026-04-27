import { useState, type DragEvent } from 'react'
import { Upload, Link2, X, Image as ImageIcon, Film, Music } from 'lucide-react'
import type { AssetKind, AssetSource, GenerationMode } from '@shared/types'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/cn'

interface Props {
  mode: GenerationMode
  kinds: AssetKind[]
  max?: number
  hint?: string
  orderedLabels?: string[]
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']
const VIDEO_EXTS = ['mp4', 'mov', 'webm', 'mkv']
const AUDIO_EXTS = ['mp3', 'wav', 'm4a', 'aac']

const KIND_LABEL: Record<AssetKind, string> = { image: '图片', video: '视频', audio: '音频' }
const KIND_ICON: Record<AssetKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  audio: Music
}

export default function AssetPicker({ mode, kinds, max, hint, orderedLabels }: Props) {
  const assets = useAppStore((s) => s.forms[mode].assets)
  const addAsset = useAppStore((s) => s.addAsset)
  const removeAsset = useAppStore((s) => s.removeAsset)

  const extsOf = (kind: AssetKind): string[] =>
    kind === 'image' ? IMAGE_EXTS : kind === 'video' ? VIDEO_EXTS : AUDIO_EXTS
  const extsHint = (kind: AssetKind) => extsOf(kind).map((e) => `.${e}`).join(',')

  const [tab, setTab] = useState<'local' | 'url'>('local')
  const [selectedKind, setSelectedKind] = useState<AssetKind>(kinds[0])
  const [urlInput, setUrlInput] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const atLimit = typeof max === 'number' && assets.length >= max

  const handlePick = async () => {
    if (atLimit) return
    const res = await window.seedland.pickFile(selectedKind, extsOf(selectedKind))
    if (res) {
      addAsset(mode, { kind: selectedKind, mode: 'local', ...res })
    }
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (atLimit) return
    const files = Array.from(e.dataTransfer.files)
    for (const f of files) {
      const kind = detectKind(f.name)
      if (!kind || !kinds.includes(kind)) continue
      const p = window.seedland.getDroppedPath(f)
      if (!p) continue
      addAsset(mode, {
        kind,
        mode: 'local',
        path: p,
        name: f.name,
        sizeBytes: f.size
      })
      if (max && assets.length + 1 >= max) break
    }
  }

  const addUrl = () => {
    const v = urlInput.trim()
    if (!/^https?:\/\//i.test(v)) return
    addAsset(mode, { kind: selectedKind, mode: 'url', url: v })
    setUrlInput('')
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <label className="field-label !mb-0">素材</label>
        {hint && <span className="text-[11px] text-text-dim">{hint}</span>}
      </div>

      {kinds.length > 1 && (
        <div className="mb-3 inline-flex rounded-lg bg-[rgba(7,11,20,0.5)] p-1 border border-[rgba(138,148,184,0.1)]">
          {kinds.map((k) => {
            const Icon = KIND_ICON[k]
            const label = KIND_LABEL[k]
            const active = selectedKind === k
            return (
              <button
                key={k}
                onClick={() => setSelectedKind(k)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-[rgba(0,229,255,0.1)] text-neon-cyan'
                    : 'text-text-muted hover:text-text'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            )
          })}
        </div>
      )}

      <div className="mb-3 flex gap-1 rounded-lg bg-[rgba(7,11,20,0.5)] p-1 border border-[rgba(138,148,184,0.1)] w-fit">
        <button
          onClick={() => setTab('local')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'local' ? 'bg-[rgba(0,229,255,0.1)] text-neon-cyan' : 'text-text-muted hover:text-text'
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          本地上传
        </button>
        <button
          onClick={() => setTab('url')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'url' ? 'bg-[rgba(0,229,255,0.1)] text-neon-cyan' : 'text-text-muted hover:text-text'
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          URL
        </button>
      </div>

      {tab === 'local' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={handlePick}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-all',
            dragOver
              ? 'border-neon-cyan bg-[rgba(0,229,255,0.06)]'
              : 'border-[rgba(138,148,184,0.18)] hover:border-[rgba(0,229,255,0.35)] hover:bg-[rgba(0,229,255,0.02)]',
            atLimit && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(0,229,255,0.08)] text-neon-cyan group-hover:bg-[rgba(0,229,255,0.14)]">
            <Upload className="h-5 w-5" />
          </div>
          <div className="mt-3 text-sm text-text">
            拖拽 <span className="text-neon-cyan">{KIND_LABEL[selectedKind]}</span> 到这里，或点击选择
          </div>
          <div className="mt-1 font-mono text-[11px] text-text-dim">{extsHint(selectedKind)}</div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
            placeholder={`https://example.com/your-${selectedKind}.${
              selectedKind === 'image' ? 'jpg' : selectedKind === 'video' ? 'mp4' : 'mp3'
            }`}
            className="input-base flex-1"
          />
          <button onClick={addUrl} className="btn-ghost" disabled={atLimit}>
            添加
          </button>
        </div>
      )}

      {assets.length > 0 && (
        <div className="mt-4 space-y-2">
          {assets.map((a, i) => (
            <AssetChip
              key={i}
              asset={a}
              label={orderedLabels?.[i]}
              onRemove={() => removeAsset(mode, i)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function AssetChip({
  asset,
  label,
  onRemove
}: {
  asset: AssetSource
  label?: string
  onRemove: () => void
}) {
  const Icon = KIND_ICON[asset.kind]
  const name = asset.mode === 'url' ? asset.url : asset.name
  const size = asset.mode === 'local' ? ` · ${formatSize(asset.sizeBytes)}` : ''
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[rgba(138,148,184,0.1)] bg-[rgba(7,11,20,0.4)] px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[rgba(0,229,255,0.08)] text-neon-cyan">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {label && <span className="chip !px-1.5 !py-0.5 !text-[10px]">{label}</span>}
          <span className="truncate text-xs text-text">{name}</span>
        </div>
        <div className="text-[10px] font-mono text-text-dim">
          {asset.mode === 'url' ? 'URL' : '本地文件'}
          {size}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:bg-[rgba(244,63,94,0.1)] hover:text-neon-rose transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function detectKind(name: string): AssetKind | null {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return null
  if (IMAGE_EXTS.includes(ext)) return 'image'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  if (AUDIO_EXTS.includes(ext)) return 'audio'
  return null
}

function formatSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
