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
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true
  }
})

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/room', require('./routes/roomRoutes'))

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