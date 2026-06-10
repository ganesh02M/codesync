import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
     socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
  withCredentials: true
})

      socketRef.current.on('connect', () => {
        setConnected(true)
        console.log('Socket connected!')
      })

      socketRef.current.on('disconnect', () => {
        setConnected(false)
      })

      return () => {
        socketRef.current?.disconnect()
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  )
}