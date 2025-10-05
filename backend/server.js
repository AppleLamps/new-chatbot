const { createApp } = require('./app')
const { OPENROUTER_CONFIG } = require('./config/openrouter')

const PORT = process.env.PORT || 4000

// Create and configure the Express app
const app = createApp()

// Start the server
app.listen(PORT, () => {
  console.log(`LampChat backend running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)

  if (!OPENROUTER_CONFIG.apiKey) {
    console.warn('⚠️  WARNING: OPENROUTER_API_KEY environment variable is not set!')
    console.warn('Please set your OpenRouter API key to enable chat functionality.')
  } else {
    console.log('✅ OpenRouter API key is configured')
  }
})

module.exports = app
