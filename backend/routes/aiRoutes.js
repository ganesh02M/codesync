const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { getAISuggestion } = require('../controllers/aiController')

router.post('/suggest', auth, getAISuggestion)

module.exports = router