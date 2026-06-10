import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { SocketProvider } from './context/SocketContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'

function App() {
  const { user, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <BrowserRouter>
      <SocketProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/editor/:roomId" element={user ? <Editor /> : <Navigate to="/login" />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App