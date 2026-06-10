const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    default: '// Start coding here...'
  },
  language: {
    type: String,
    default: 'javascript'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  }]
}, { timestamps: true })

module.exports = mongoose.model('Room', roomSchema)