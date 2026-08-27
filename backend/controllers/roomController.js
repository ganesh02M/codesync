const Room = require('../models/Room')
const { v4: uuidv4 } = require('uuid')

exports.createRoom = async (req, res) => {
  try {
    const { name, language } = req.body
    const roomId = uuidv4().substring(0, 8)
    const room = await Room.create({
      roomId,
      name,
      language: language || 'javascript',
      createdBy: req.user._id,
      participants: [{ userId: req.user._id, name: req.user.name, email: req.user.email }]
    })
    return res.status(201).json({ success: true, message: 'Room created', data: room })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params
    const room = await Room.findOne({ roomId })
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' })
    }
    const alreadyJoined = room.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    )
    if (!alreadyJoined) {
      room.participants.push({
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email
      })
      await room.save()
    }
    return res.status(200).json({ success: true, data: room })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params
    const room = await Room.findOne({ roomId })
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' })
    }
    return res.status(200).json({ success: true, data: room })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, data: rooms })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.saveCode = async (req, res) => {
  try {
    const { roomId } = req.params
    const { code, language } = req.body
    const room = await Room.findOneAndUpdate(
      { roomId },
      { code, language },
      { new: true }
    )
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' })
    }
    return res.status(200).json({ success: true, data: room })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.runCode = async (req, res) => {
  try {
    const { code, language } = req.body

    const pistonLangMap = {
      javascript: { language: 'javascript', version: '18.15.0' },
      python: { language: 'python', version: '3.10.0' },
      cpp: { language: 'cpp', version: '10.2.0' },
      c: { language: 'c', version: '10.2.0' },
      java: { language: 'java', version: '15.0.2' },
      typescript: { language: 'typescript', version: '5.0.3' }
    }

    const config = pistonLangMap[language]
    if (!config) {
      return res.status(400).json({ success: false, message: 'Unsupported language' })
    }

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: code }]
      })
    })

    const data = await response.json()
    console.log('Piston response:', JSON.stringify(data))

    const output = data.run?.stdout || data.run?.stderr || data.message || 'No output'

    return res.status(200).json({ success: true, output })
  } catch (error) {
    console.error('runCode error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}