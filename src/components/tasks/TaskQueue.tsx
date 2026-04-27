import { useMemo, useState } from 'react'
import { Inbox, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import TaskCard from './TaskCard'
import VideoPreviewModal from './VideoPreviewModal'
import type { TaskRecord } from '@shared/types'

export default function TaskQueue() {
  const tasks = useAppStore((s) => s.tasks)
  const clearTasks = useAppStore((s) => s.clearTasks)
  const [previewing, setPreviewing] = useState<TaskRecord | null>(null)

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => b.createdAt - a.createdAt),
    [tasks]
  )

  const onClear = async () => {
    await window.seedland.clearTasks()
    clearTasks()
  }

  return (
    <>
      <aside className="flex w-80 flex-col border-l border-[rgba(0,229,255,0.08)]">
        <header className="flex h-14 items-center justify-between border-b border-[rgba(0,229,255,0.08)] px-5">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-neon-cyan" />
            <span className="text-sm font-medium">任务队列</span>
            {sorted.length > 0 && (
              <span className="chip !bg-[rgba(168,85,247,0.08)] !text-neon-violet !border-[rgba(168,85,247,0.2)] !px-1.5 !py-0 !text-[10px]">
                {sorted.length}
              </span>
            )}
          </div>
          {sorted.length > 0 && (
            <button
              onClick={onClear}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim hover:text-neon-rose hover:bg-[rgba(244,63,94,0.08)] transition-colors"
              title="清空"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {sorted.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)]">
                <Inbox className="h-6 w-6 text-text-dim" />
              </div>
              <p className="mt-3 text-sm text-text-muted">还没有任务</p>
              <p className="mt-1 text-[11px] text-text-dim">提交后会在这里显示进度</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {sorted.map((t) => (
                <motion.div
                  key={t.localId}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <TaskCard task={t} onPreview={() => setPreviewing(t)} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </aside>

      {previewing && <VideoPreviewModal task={previewing} onClose={() => setPreviewing(null)} />}
    </>
  )
}
