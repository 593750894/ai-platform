import { promises as fs } from 'node:fs'
import path from 'node:path'

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac'
}

export async function fileToDataUri(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream'
  const buf = await fs.readFile(filePath)
  return `data:${mime};base64,${buf.toString('base64')}`
}

export async function fileStats(filePath: string): Promise<{ sizeBytes: number }> {
  const s = await fs.stat(filePath)
  return { sizeBytes: s.size }
}
