import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0d1117'
    }}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d',
        borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#58a6ff', fontSize: '28px', marginBottom: '8px' }}>
            {'</>'}  CodeSync
          </h1>
          <p style={{ color: '#8b949e' }}>Real-time collaborative coding</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#8b949e', marginBottom: '6px', fontSize: '14px' }}>Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 14px', background: '#0d1117',
                border: '1px solid #30363d', borderRadius: '8px',
                color: '#e6edf3', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#8b949e', marginBottom: '6px', fontSize: '14px' }}>Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', background: '#0d1117',
                border: '1px solid #30363d', borderRadius: '8px',
                color: '#e6edf3', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit" disabled={isLoading}
            style={{
              width: '100%', padding: '12px', background: '#238636',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#8b949e', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#58a6ff', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login