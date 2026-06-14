const User = require('../models/User')
const jwt = require('jsonwebtoken')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' })
    }
    const user = await User.create({ name, email, password })
    const token = signToken(user._id)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.log("REGISTER ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
}
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }
    const token = signToken(user._id)
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.logout = async (req, res) => {
  res.clearCookie('token')
  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}

exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { id: req.user._id, name: req.user.name, email: req.user.email }
  })
}