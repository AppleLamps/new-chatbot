require('dotenv').config()

const OPENROUTER_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultModel: 'anthropic/claude-3-haiku:beta',
  imageGenerationModel: 'google/gemini-2.5-flash-image-preview',
  headers: {
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    'X-Title': 'LampChat'
  },
  timeout: 30000,
  imageTimeout: 60000
}

module.exports = { OPENROUTER_CONFIG }

