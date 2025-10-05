const axios = require('axios')
const { OPENROUTER_CONFIG } = require('../config/openrouter')

/**
 * Send a chat request to OpenRouter
 * 
 * @param {Array} messages - Formatted messages
 * @param {string} model - Model to use
 * @param {Object} options - Additional options (enableImageGeneration, enableWebSearch)
 * @returns {Promise<Object>} Response from OpenRouter
 */
async function sendChatRequest(messages, model, options = {}) {
  const { enableImageGeneration = false, enableWebSearch = false } = options

  // Prepare request payload with usage tracking to monitor cache performance
  const requestPayload = {
    model: enableImageGeneration ? OPENROUTER_CONFIG.imageGenerationModel : model,
    messages: messages
  }

  // Add modalities for image generation (minimal params as per OpenRouter docs)
  if (enableImageGeneration) {
    requestPayload.modalities = ['image', 'text']
  } else {
    requestPayload.max_tokens = 1000
    requestPayload.temperature = 0.7
    requestPayload.usage = { include: true } // Track cache usage for monitoring
  }

  // Add web search plugin if enabled (not supported during image generation)
  if (enableWebSearch && !enableImageGeneration) {
    requestPayload.plugins = {
      web: {
        enabled: true,
        max_results: 5
      }
    }
  }
  if (enableWebSearch && enableImageGeneration) {
    console.warn('Web search plugin is ignored when image generation is enabled')
  }

  // Log request for debugging image generation
  if (enableImageGeneration) {
    console.log('Image generation request:', JSON.stringify(requestPayload, null, 2))
  }

  // Make request to OpenRouter
  const response = await axios.post(
    `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
    requestPayload,
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        ...OPENROUTER_CONFIG.headers
      },
      timeout: enableImageGeneration ? OPENROUTER_CONFIG.imageTimeout : OPENROUTER_CONFIG.timeout
    }
  )

  return response.data
}

/**
 * Send a streaming chat request to OpenRouter
 * 
 * @param {Array} messages - Formatted messages
 * @param {string} model - Model to use
 * @param {Object} options - Additional options (enableImageGeneration, enableWebSearch)
 * @returns {Promise<Object>} Axios response with stream
 */
async function sendStreamRequest(messages, model, options = {}) {
  const { enableImageGeneration = false, enableWebSearch = false } = options

  const requestPayload = {
    model: enableImageGeneration ? OPENROUTER_CONFIG.imageGenerationModel : model,
    messages: messages,
    stream: true
  }

  // Add modalities for image generation
  if (enableImageGeneration) {
    requestPayload.modalities = ['image', 'text']
    delete requestPayload.stream // Image generation typically doesn't support streaming
  } else {
    requestPayload.max_tokens = 1000
    requestPayload.temperature = 0.7
    requestPayload.usage = { include: true }
  }

  // Add web search plugin if enabled
  if (enableWebSearch && !enableImageGeneration) {
    requestPayload.plugins = {
      web: {
        enabled: true,
        max_results: 5
      }
    }
  }

  // Log request for debugging
  if (enableImageGeneration) {
    console.log('Image generation streaming request:', JSON.stringify(requestPayload, null, 2))
  }

  const response = await axios.post(
    `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
    requestPayload,
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        ...OPENROUTER_CONFIG.headers
      },
      timeout: enableImageGeneration ? OPENROUTER_CONFIG.imageTimeout : OPENROUTER_CONFIG.timeout,
      responseType: enableImageGeneration ? 'json' : 'stream'
    }
  )

  return response
}

/**
 * Send a request to generate follow-up suggestions
 * 
 * @param {Array} messages - Recent conversation messages
 * @returns {Promise<Array>} Array of suggestion strings
 */
async function generateSuggestions(messages) {
  // Create context from last few messages
  const recentMessages = messages.slice(-4) // Use last 4 messages for context
  const contextMessage = {
    role: 'system',
    content: 'Based on the conversation, generate 3-4 short follow-up questions or suggestions that would be natural next things for the user to ask. Keep them concise and relevant. Return as a JSON array of strings.'
  }

  const response = await axios.post(
    `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
    {
      model: OPENROUTER_CONFIG.defaultModel,
      messages: [contextMessage, ...recentMessages.map(msg => ({ role: msg.role, content: msg.content }))],
      max_tokens: 200,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        ...OPENROUTER_CONFIG.headers
      },
      timeout: OPENROUTER_CONFIG.timeout
    }
  )

  const rawResponse = response.data.choices[0]?.message?.content

  try {
    // Try to parse as JSON
    const suggestions = JSON.parse(rawResponse)
    return Array.isArray(suggestions) ? suggestions.slice(0, 4) : []
  } catch (e) {
    // If not JSON, try to extract suggestions from text
    const extractedSuggestions = rawResponse
      .split('\n')
      .filter(line => line.trim().length > 0 && !line.match(/^\d+\./))
      .slice(0, 4)
    return extractedSuggestions
  }
}

module.exports = {
  sendChatRequest,
  sendStreamRequest,
  generateSuggestions
}

