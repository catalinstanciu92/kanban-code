import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
  type: string
  payload?: unknown
}

interface UseWebSocketOptions {
  onMessage: (message: WebSocketMessage) => void
  reconnectInterval?: number
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { onMessage, reconnectInterval = 3000 } = options
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onMessageRef = useRef(onMessage)
  const shouldReconnectRef = useRef(true)
  
  // Keep onMessage ref updated
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    shouldReconnectRef.current = true
    
    function createConnection() {
      const wsUrl = import.meta.env?.VITE_WS_URL ?? 'ws://localhost:7895/ws'
      
      try {
        wsRef.current = new WebSocket(wsUrl)
        
        wsRef.current.onopen = () => {
          setIsConnected(true)
          console.log('WebSocket connected')
        }
        
        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage
            onMessageRef.current(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
        
        wsRef.current.onclose = () => {
          setIsConnected(false)
          console.log('WebSocket disconnected')
          
          if (shouldReconnectRef.current) {
            console.log('Reconnecting...')
            reconnectTimeoutRef.current = setTimeout(() => {
              createConnection()
            }, reconnectInterval)
          }
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
      }
    }
    
    createConnection()
    
    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [reconnectInterval])

  return { isConnected }
}
