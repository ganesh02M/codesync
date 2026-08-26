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
    const langMap = {
      javascript: 'javascript',
      python: 'python',
      cpp: 'cpp',
      java: 'java',
      typescript: 'typescript',
      c: 'c'
    }
    const extMap = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      java: 'java',
      typescript: 'ts',
      c: 'c'
    }
    const fileName = language === 'java' ? 'Main.java' : `main.${extMap[language]}`
    console.log('Running:', language, fileName)
    const response = await fetch(`https://glot.io/api/run/${langMap[language]}/latest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.GLOT_TOKEN}`
      },
      body: JSON.stringify({
        files: [{ name: fileName, content: code }]
      })
    })
    const data = await response.json()
    return res.status(200).json({
      success: true,
      output: data.stdout || data.stderr || 'No output'
    })
  } catch (error) {
     console.error('runCode error:', error) 
    return res.status(500).json({ success: false, message: error.message })
  }
}