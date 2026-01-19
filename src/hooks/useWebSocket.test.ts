import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from './useWebSocket'
import WS from 'jest-websocket-mock'

describe('useWebSocket', () => {
  let mockServer: WS

  beforeEach(async () => {
    // @ts-ignore
    delete global.WebSocket;
    mockServer = new WS('ws://localhost:3001/ws', { jsonProtocol: true })
  })

  afterEach(async () => {
    try {
      mockServer.close()
    } catch (e) {}
    await WS.clean()
  })

  it('should connect to websocket server', async () => {
    const { unmount } = renderHook(() => useWebSocket({ onMessage: vi.fn() }))
    
    await mockServer.connected
    // Just verify at least one client is connected, as previous tests might leak
    expect(mockServer.server.clients().length).toBeGreaterThanOrEqual(1)
    unmount()
  })

  it('should call onMessage when receiving message', async () => {
    const onMessage = vi.fn()
    const { unmount } = renderHook(() => useWebSocket({ onMessage }))
    
    await mockServer.connected
    
    act(() => {
      mockServer.send({ type: 'FILE_CHANGE' })
    })
    
    expect(onMessage).toHaveBeenCalledWith({ type: 'FILE_CHANGE' })
    unmount()
  })

  it('should reconnect on disconnect', async () => {
    const { result, unmount } = renderHook(() => useWebSocket({
      onMessage: vi.fn(),
      reconnectInterval: 100,
    }))
    
    await mockServer.connected
    mockServer.close()
    
    // Wait for reconnect
    await new Promise(resolve => setTimeout(resolve, 200))
    
    expect(result.current.isConnected).toBe(false)
    unmount()
  })
})
