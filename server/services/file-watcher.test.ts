import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createFileWatcher } from './file-watcher'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'

describe('FileWatcher', () => {
  let testDir: string
  let activeWatcher: ReturnType<typeof createFileWatcher> | null = null

  beforeEach(async () => {
    testDir = join(process.cwd(), `test-db-${Math.random().toString(36).slice(2)}`)
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    if (activeWatcher) {
      activeWatcher.close()
      activeWatcher = null
    }
    await rm(testDir, { recursive: true, force: true })
  })

  it('should emit event on file change', async () => {
    const onChange = vi.fn()
    activeWatcher = createFileWatcher(testDir, {
      debounceMs: 50,
      onChange,
    })

    // Create a file to trigger change
    await writeFile(join(testDir, 'test-change-1.csv'), 'data')
    
    // Wait for debounced callback
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should ignore specified patterns', async () => {
    const onChange = vi.fn()
    activeWatcher = createFileWatcher(testDir, {
      debounceMs: 50,
      ignorePatterns: ['.tmp'],
      onChange,
    })

    await writeFile(join(testDir, 'ignore-me-2.tmp'), 'data')
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(onChange).not.toHaveBeenCalled()
  })
})
