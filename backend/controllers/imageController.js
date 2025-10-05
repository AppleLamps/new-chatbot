const { sendChatRequest } = require('../services/openRouterService')
const { OPENROUTER_CONFIG } = require('../config/openrouter')

/**
 * Handle image generation request
 */
async function handleImageGeneration(req, res) {
  try {
    const { prompt, model = OPENROUTER_CONFIG.imageGenerationModel } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // Generate image using OpenRouter
    const messages = [{ role: 'user', content: prompt }]
    const responseData = await sendChatRequest(messages, model, {
      enableImageGeneration: true,
      enableWebSearch: false
    })

    const images = responseData.choices[0]?.message?.images || []
    res.json({
      success: true,
      images
    })
  } catch (error) {
    console.error('Image generation error:', error.response?.data || error.message)
    res.status(500).json({ error: 'Image generation failed' })
  }
}

/**
 * Handle text-to-speech request (placeholder)
 */
async function handleTextToSpeech(req, res) {
  try {
    const { text } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // For now, we'll rely on client-side Web Speech API
    // This endpoint is a placeholder for future server-side TTS integration
    res.json({
      success: true,
      message: 'Use client-side Web Speech API for now'
    })
  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({ error: 'TTS failed' })
  }
}

module.exports = {
  handleImageGeneration,
  handleTextToSpeech
}

