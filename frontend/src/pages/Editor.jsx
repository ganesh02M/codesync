import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MonacoEditor from '@monaco-editor/react'
import { useAuthStore } from '../store/authStore'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import toast from 'react-hot-toast'

function EditorPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { socket } = useSocket()
  const [room, setRoom] = useState(null)
  const [code, setCode] = useState('// Start coding here...')
  const [language, setLanguage] = useState('javascript')
  const [users, setUsers] = useState([])
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [cursors, setCursors] = useState({})
  const isRemoteChange = useRef(false)
  const chatEndRef = useRef(null)
  const aiEndRef = useRef(null)
  const editorRef = useRef(null)
  const decorationsRef = useRef([])
  const [showAI, setShowAI] = useState(true)
  const [aiMessages, setAiMessages] = useState([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { fetchRoom() }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  useEffect(() => {
    if (!socket || !room) return

    socket.emit('join-room', { roomId, user })

    socket.on('room-users', (roomUsers) => setUsers(roomUsers))
    socket.on('user-joined', ({ user: u }) => {
      toast.success(`${u.name} joined!`)
      setMessages(prev => [...prev, { system: true, text: `${u.name} joined the room`, time: new Date().toLocaleTimeString() }])
    })
    socket.on('user-left', ({ user: u }) => {
      toast(`${u?.name} left`, { icon: '👋' })
      setMessages(prev => [...prev, { system: true, text: `${u?.name} left the room`, time: new Date().toLocaleTimeString() }])
    })
    socket.on('code-update', (newCode) => {
      isRemoteChange.current = true
      setCode(newCode)
    })
    socket.on('language-update', (lang) => setLanguage(lang))
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    socket.on('cursor-update', ({ cursor, user: u, socketId }) => {
      setCursors(prev => ({ ...prev, [socketId]: { cursor, user: u } }))
    })
    socket.on('cursor-remove', ({ socketId }) => {
      setCursors(prev => {
        const updated = { ...prev }
        delete updated[socketId]
        return updated
      })
    })

    return () => {
      socket.off('room-users')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('code-update')
      socket.off('language-update')
      socket.off('new-message')
      socket.off('cursor-update')
      socket.off('cursor-remove')
    }
  }, [socket, room])

  // Live cursors in editor
  useEffect(() => {
    if (!editorRef.current) return
    const newDecorations = Object.entries(cursors).map(([socketId, { cursor, user: u }]) => ({
      range: {
        startLineNumber: cursor?.lineNumber || 1,
        startColumn: cursor?.column || 1,
        endLineNumber: cursor?.lineNumber || 1,
        endColumn: (cursor?.column || 1) + 1
      },
      options: {
        className: 'remote-cursor',
        hoverMessage: { value: u?.name || 'User' },
        beforeContentClassName: 'cursor-label',
      }
    }))
    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current, newDecorations
    )
  }, [cursors])

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/room/${roomId}`)
      setRoom(res.data.data)
      setCode(res.data.data.code)
      setLanguage(res.data.data.language)
    } catch {
      toast.error('Room not found')
      navigate('/')
    }
  }

  const handleCodeChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false
      return
    }
    setCode(value)
    socket?.emit('code-change', { roomId, code: value })
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    socket?.emit('language-change', { roomId, language: lang })
  }

  const handleCursorChange = (e) => {
    const position = e.position
    socket?.emit('cursor-move', { roomId, cursor: position, user })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.post(`/room/save/${roomId}`, { code, language })
      toast.success('Code saved!')
    } catch {
      toast.error('Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('Running...')
    try {
      const res = await api.post('/room/run', { code, language })
      setOutput(res.data.output)
    } catch {
      setOutput('Run failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    socket?.emit('chat-message', { roomId, message: chatInput, user })
    setChatInput('')
  }

  const handleAskAI = async (e) => {
    e.preventDefault()
    if (!aiInput.trim()) return

    const userMessage = aiInput
    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setAiInput('')
    setAiLoading(true)

    try {
      const res = await api.post('/ai/suggest', {
        code,
        prompt: userMessage,
        language
      })
      setAiMessages(prev => [...prev, { role: 'ai', text: res.data.response }])
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Error: Could not get AI response' }])
    } finally {
      setAiLoading(false)
    }
  }

  const handleEditorMount = (editor) => {
    editorRef.current = editor
    editor.onDidChangeCursorPosition(handleCursorChange)
  }

  const btnStyle = (bg) => ({
    padding: '8px 16px', background: bg, color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600'
  })

  const COLORS = ['#f78166', '#79c0ff', '#56d364', '#e3b341', '#bc8cff', '#ff7b72']

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      {/* Navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#161b22', borderBottom: '1px solid #30363d',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ color: '#58a6ff', fontSize: '18px', cursor: 'pointer' }}
            onClick={() => navigate('/')}>{'</>'} CodeSync</h2>
          <span style={{ color: '#e6edf3', fontSize: '14px' }}>{room?.name}</span>
          <span style={{
            background: '#0d1117', border: '1px solid #30363d',
            padding: '4px 10px', borderRadius: '6px', color: '#8b949e', fontSize: '12px'
          }}>🔑 {roomId}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3',
              padding: '6px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
            }}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="typescript">TypeScript</option>
          </select>
          <button onClick={() => { setShowAI(!showAI); setShowChat(false) }} style={btnStyle('#8b5cf6')}>
            🤖 AI
          </button>
          <button onClick={() => { setShowChat(!showChat); setShowAI(false) }} style={btnStyle('#30363d')}>
            💬 Chat
          </button>
          <button onClick={handleSave} disabled={isSaving} style={btnStyle('#1f6feb')}>
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
          <button onClick={handleRun} disabled={isRunning} style={btnStyle('#238636')}>
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
          <button onClick={() => navigate('/')} style={btnStyle('#da3633')}>← Back</button>
        </div>
      </div>

      {/* Users bar */}
      <div style={{
        display: 'flex', gap: '8px', padding: '6px 16px', alignItems: 'center',
        background: '#161b22', borderBottom: '1px solid #30363d', flexShrink: 0
      }}>
        <span style={{ color: '#8b949e', fontSize: '12px' }}>Online: </span>
        {users.map((u, i) => (
          <span key={i} style={{
            background: COLORS[i % COLORS.length], color: '#0d1117',
            padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
          }}>{u.user?.name}</span>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1 }}>
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output Panel */}
          <div style={{
            height: '160px', background: '#161b22',
            borderTop: '1px solid #30363d', flexShrink: 0
          }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #30363d' }}>
              <span style={{ color: '#8b949e', fontSize: '12px', fontWeight: '600' }}>OUTPUT</span>
            </div>
            <pre style={{
              padding: '10px 16px', color: '#e6edf3', fontSize: '13px',
              overflow: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap',
              height: 'calc(100% - 35px)', margin: 0
            }}>
              {output || 'Click ▶ Run to execute code'}
            </pre>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {showAI && (
          <div style={{
            width: '320px', background: '#161b22',
            borderLeft: '1px solid #30363d', display: 'flex', flexDirection: 'column',
            flexShrink: 0
          }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #30363d' }}>
              <span style={{ color: '#8b949e', fontSize: '13px', fontWeight: '600' }}>🤖 AI ASSISTANT</span>
            </div>

            {/* AI Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {aiMessages.length === 0 ? (
                <div style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ marginBottom: '12px' }}>Ask AI about your code:</p>
                  <p style={{ marginBottom: '6px' }}>💡 "Explain this code"</p>
                  <p style={{ marginBottom: '6px' }}>🐛 "Find bugs in this"</p>
                  <p style={{ marginBottom: '6px' }}>⚡ "Optimize this code"</p>
                </div>
              ) : (
                aiMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{
                        color: msg.role === 'user' ? '#58a6ff' : '#bc8cff',
                        fontSize: '12px', fontWeight: '600'
                      }}>
                        {msg.role === 'user' ? '👤 You' : '🤖 AI'}
                      </span>
                    </div>
                    <pre style={{
                      color: '#e6edf3', fontSize: '12px', background: '#0d1117',
                      padding: '8px 10px', borderRadius: '6px', margin: 0,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      fontFamily: msg.role === 'ai' ? 'monospace' : 'inherit'
                    }}>{msg.text}</pre>
                  </div>
                ))
              )}
              {aiLoading && (
                <div style={{ color: '#8b949e', fontSize: '12px', fontStyle: 'italic' }}>
                  🤖 AI is thinking...
                </div>
              )}
              <div ref={aiEndRef} />
            </div>

            {/* AI Input */}
            <form onSubmit={handleAskAI} style={{
              padding: '10px', borderTop: '1px solid #30363d',
              display: 'flex', gap: '6px'
            }}>
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask AI about your code..."
                disabled={aiLoading}
                style={{
                  flex: 1, padding: '8px', background: '#0d1117',
                  border: '1px solid #30363d', borderRadius: '6px',
                  color: '#e6edf3', fontSize: '13px', outline: 'none'
                }}
              />
              <button type="submit" disabled={aiLoading} style={{
                padding: '8px 12px', background: '#8b5cf6',
                color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>→</button>
            </form>
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <div style={{
            width: '280px', background: '#161b22',
            borderLeft: '1px solid #30363d', display: 'flex', flexDirection: 'column',
            flexShrink: 0
          }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #30363d' }}>
              <span style={{ color: '#8b949e', fontSize: '13px', fontWeight: '600' }}>💬 CHAT</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {messages.length === 0 ? (
                <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center' }}>
                  No messages yet
                </p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    {msg.system ? (
                      <p style={{ color: '#8b949e', fontSize: '11px', textAlign: 'center', fontStyle: 'italic' }}>
                        {msg.text}
                      </p>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: COLORS[i % COLORS.length], fontSize: '12px', fontWeight: '600' }}>
                            {msg.user?.name}
                          </span>
                          <span style={{ color: '#8b949e', fontSize: '11px' }}>{msg.time}</span>
                        </div>
                        <p style={{
                          color: '#e6edf3', fontSize: '13px', background: '#0d1117',
                          padding: '6px 10px', borderRadius: '6px', margin: 0
                        }}>{msg.message}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{
              padding: '10px', borderTop: '1px solid #30363d',
              display: 'flex', gap: '6px'
            }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message..."
                style={{
                  flex: 1, padding: '8px', background: '#0d1117',
                  border: '1px solid #30363d', borderRadius: '6px',
                  color: '#e6edf3', fontSize: '13px', outline: 'none'
                }}
              />
              <button type="submit" style={{
                padding: '8px 12px', background: '#1f6feb',
                color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>→</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorPage
