import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [joinId, setJoinId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await api.get('/room/my-rooms')
      setRooms(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await api.post('/room/create', { name: roomName, language })
      toast.success('Room created!')
      navigate(`/editor/${res.data.data.roomId}`)
    } catch (error) {
      toast.error('Failed to create room')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post(`/room/join/${joinId}`)
      navigate(`/editor/${joinId}`)
    } catch (error) {
      toast.error('Room not found')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const cardStyle = {
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: '12px', padding: '24px'
  }

  const btnStyle = (bg) => ({
    padding: '10px 20px', background: bg, color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  })

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px',
    color: '#e6edf3', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', marginBottom: '12px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '24px' }}>
      {/* Navbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '32px', ...cardStyle
      }}>
        <h1 style={{ color: '#58a6ff', fontSize: '22px' }}>{'</>'} CodeSync</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#8b949e', fontSize: '14px' }}>👋 {user?.name}</span>
          <button onClick={handleLogout} style={btnStyle('#da3633')}>Logout</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => { setShowCreate(true); setShowJoin(false) }} style={btnStyle('#238636')}>
          + Create Room
        </button>
        <button onClick={() => { setShowJoin(true); setShowCreate(false) }} style={btnStyle('#1f6feb')}>
          → Join Room
        </button>
      </div>

      {/* Create Room Form */}
      {showCreate && (
        <div style={{ ...cardStyle, marginBottom: '24px', maxWidth: '400px' }}>
          <h3 style={{ color: '#e6edf3', marginBottom: '16px' }}>Create New Room</h3>
          <form onSubmit={handleCreate}>
            <input
              type="text" required placeholder="Room name"
              value={roomName} onChange={(e) => setRoomName(e.target.value)}
              style={inputStyle}
            />
            <select
              value={language} onChange={(e) => setLanguage(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isLoading} style={btnStyle('#238636')}>
                {isLoading ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} style={btnStyle('#30363d')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join Room Form */}
      {showJoin && (
        <div style={{ ...cardStyle, marginBottom: '24px', maxWidth: '400px' }}>
          <h3 style={{ color: '#e6edf3', marginBottom: '16px' }}>Join Room</h3>
          <form onSubmit={handleJoin}>
            <input
              type="text" required placeholder="Enter Room ID"
              value={joinId} onChange={(e) => setJoinId(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isLoading} style={btnStyle('#1f6feb')}>
                {isLoading ? 'Joining...' : 'Join'}
              </button>
              <button type="button" onClick={() => setShowJoin(false)} style={btnStyle('#30363d')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Rooms */}
      <div style={cardStyle}>
        <h3 style={{ color: '#e6edf3', marginBottom: '16px' }}>My Rooms</h3>
        {rooms.length === 0 ? (
          <p style={{ color: '#8b949e' }}>No rooms yet — create one!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {rooms.map(room => (
              <div
                key={room._id}
                onClick={() => navigate(`/editor/${room.roomId}`)}
                style={{
                  background: '#0d1117', border: '1px solid #30363d',
                  borderRadius: '8px', padding: '16px', cursor: 'pointer'
                }}
              >
                <h4 style={{ color: '#e6edf3', marginBottom: '8px' }}>{room.name}</h4>
                <p style={{ color: '#58a6ff', fontSize: '12px', marginBottom: '4px' }}>
                  🔑 {room.roomId}
                </p>
                <p style={{ color: '#8b949e', fontSize: '12px' }}>
                  {room.language} • {room.participants.length} participants
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard