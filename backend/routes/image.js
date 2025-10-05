const express = require('express')
const { handleImageGeneration, handleTextToSpeech } = require('../controllers/imageController')
const { validateApiKey } = require('../middleware/validation')
const { OPENROUTER_CONFIG } = require('../config/openrouter')

const router = express.Router()

// Middleware to validate API key
const checkApiKey = validateApiKey(OPENROUTER_CONFIG.apiKey)

router.post('/api/generate-image', checkApiKey, handleImageGeneration)
router.post('/api/text-to-speech', handleTextToSpeech)

module.exports = router

