const express = require('express')
const { handleChat, handleStreamChat, handleSuggestions } = require('../controllers/chatController')
const { validateMessages, validateApiKey } = require('../middleware/validation')
const { OPENROUTER_CONFIG } = require('../config/openrouter')

const router = express.Router()

/**
 * Factory function to create chat routes with uploads directory
 * @param {string} uploadsDir - Path to uploads directory
 */
function createChatRoutes(uploadsDir) {
  // Middleware to validate API key
  const checkApiKey = validateApiKey(OPENROUTER_CONFIG.apiKey)

  // Standard chat endpoint
  router.post('/api/chat', validateMessages, checkApiKey, (req, res) => {
    handleChat(req, res, uploadsDir)
  })

  // Streaming chat endpoint
  router.post('/api/chat/stream', validateMessages, checkApiKey, (req, res) => {
    handleStreamChat(req, res, uploadsDir)
  })

  // Suggestions endpoint
  router.post('/api/suggestions', validateMessages, checkApiKey, (req, res) => {
    handleSuggestions(req, res)
  })

  return router
}

module.exports = { createChatRoutes }

