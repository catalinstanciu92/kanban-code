import { watch, type FSWatcher } from 'fs'
import { basename } from 'path'

interface FileWatcherOptions {
  debounceMs?: number
  ignorePatterns?: string[]
  onChange: (event: { file: string; timestamp: string }) => void
}

export function createFileWatcher(dbPath: string, options: FileWatcherOptions) {
  const { debounceMs = 300, ignorePatterns = [], onChange } = options
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  const dbDirName = basename(dbPath)
  
  const watcher: FSWatcher = watch(dbPath, { recursive: true }, (event, filename) => {
    if (!filename) return
    
    // Ignore the directory itself if reported (happens on some platforms)
    if (filename === dbDirName || filename === '.' || filename === '') return

    // Check ignore patterns
    const shouldIgnore = ignorePatterns.some(pattern => {
      if (pattern.startsWith('*.')) {
        const ext = pattern.slice(1)
        return filename.endsWith(ext)
      }
      return filename === pattern || filename.endsWith(pattern)
    })
    
    if (shouldIgnore) return
    
    // Debounce rapid changes
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      onChange({
        file: filename,
        timestamp: new Date().toISOString(),
      })
    }, debounceMs)
  })
  
  return {
    close: () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      watcher.close()
    },
  }
}
