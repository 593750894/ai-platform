import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import GridBackground from './components/effects/GridBackground'
import TaskQueue from './components/tasks/TaskQueue'
import TextToVideo from './modes/TextToVideo'
import ImageToVideo from './modes/ImageToVideo'
import FirstLastFrame from './modes/FirstLastFrame'
import MultiReference from './modes/MultiReference'
import { useAppStore } from './lib/store'

const pages = {
  'text-to-video': TextToVideo,
  'image-to-video': ImageToVideo,
  'first-last-frame': FirstLastFrame,
  'multi-reference': MultiReference
}

export default function App() {
  const currentMode = useAppStore((s) => s.currentMode)
  const setApiStatus = useAppStore((s) => s.setApiStatus)
  const mergeTask = useAppStore((s) => s.mergeTask)
  const setTasks = useAppStore((s) => s.setTasks)

  useEffect(() => {
    window.seedland.getApiStatus().then(setApiStatus)
    window.seedland.listTasks().then(setTasks)
    const off = window.seedland.onTaskUpdate((task) => mergeTask(task))
    return off
  }, [setApiStatus, setTasks, mergeTask])

  const Page = pages[currentMode]

  return (
    <div className="relative h-screen w-screen overflow-hidden text-text">
      <GridBackground />
      <div className="relative z-10 flex h-full flex-col">
        <Topbar />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-auto px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mx-auto max-w-3xl"
              >
                <Page />
              </motion.div>
            </AnimatePresence>
          </main>
          <TaskQueue />
        </div>
      </div>
    </div>
  )
}
