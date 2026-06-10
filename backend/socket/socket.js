const Room = require('../models/Room')

module.exports = (io) => {
  const rooms = {}

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join room
    socket.on('join-room', async ({ roomId, user }) => {
      socket.join(roomId)

      if (!rooms[roomId]) rooms[roomId] = {}
      rooms[roomId][socket.id] = { user, cursor: null }

      socket.emit('room-users', Object.values(rooms[roomId]))
      socket.to(roomId).emit('user-joined', { user, socketId: socket.id })

      console.log(`${user.name} joined room ${roomId}`)
    })

    // Code change
    socket.on('code-change', ({ roomId, code }) => {
      socket.to(roomId).emit('code-update', code)
    })

    // Language change
    socket.on('language-change', ({ roomId, language }) => {
      io.to(roomId).emit('language-update', language)
    })

    // Cursor position
    socket.on('cursor-move', ({ roomId, cursor, user }) => {
      socket.to(roomId).emit('cursor-update', {
        cursor, user, socketId: socket.id
      })
    })

    // Chat message
    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('new-message', {
        message,
        user,
        time: new Date().toLocaleTimeString()
      })
    })

    // Disconnect
    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomId) => {
        if (rooms[roomId]) {
          const user = rooms[roomId][socket.id]?.user
          delete rooms[roomId][socket.id]
          socket.to(roomId).emit('user-left', { user, socketId: socket.id })
          socket.to(roomId).emit('cursor-remove', { socketId: socket.id })
        }
      })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}