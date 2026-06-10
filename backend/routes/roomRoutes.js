const express = require('express')
const router = express.Router()
const {
  createRoom,
  joinRoom,
  getRoom,
  getUserRooms,
  saveCode,
  runCode
} = require('../controllers/roomController')
const auth = require('../middleware/auth')

router.post('/create', auth, createRoom)
router.get('/my-rooms', auth, getUserRooms)
router.post('/run', auth, runCode)
router.get('/:roomId', auth, getRoom)
router.post('/join/:roomId', auth, joinRoom)
router.post('/save/:roomId', auth, saveCode)

module.exports = router