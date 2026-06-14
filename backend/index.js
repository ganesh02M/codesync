const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const http = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/db')

dotenv.config()

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  'http://localhost:5173',
  'https://codesync-self.vercel.app',
  /\.vercel\.app$/
]

const corsCheck = (origin, callback) => {
  if (!origin) return callback(null, true)
  const allowed = allowedOrigins.some(o =>
    o instanceof RegExp ? o.test(origin) : o === origin
  )
  callback(null, allowed)
}

const io = new Server(server, {
  cors: {
    origin: corsCheck,
    credentials: true
  }
})

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: corsCheck,
  credentials: true
}))

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/room', require('./routes/roomRoutes'))
app.use('/api/ai', require('./routes/aiRoutes'))

// Socket.io
require('./socket/socket')(io)

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CodeSync server running 🚀' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
  })
})