const { sendChatRequest, sendStreamRequest, generateSuggestions } = require('../services/openRouterService')
const { formatMessagesForOpenRouter } = require('../utils/messageFormatter')

/**
 * Handle non-streaming chat request
 */
async function handleChat(req, res, uploadsDir) {
  try {
    const { 
      messages, 
      model = 'anthropic/claude-3-haiku:beta', 
      enableImageGeneration = false, 
      enableWebSearch = false 
    } = req.body

    // Format messages for OpenRouter
    const openRouterMessages = formatMessagesForOpenRouter(
      messages, 
      uploadsDir, 
      enableImageGeneration
    )

    // Make request to OpenRouter
    const responseData = await sendChatRequest(openRouterMessages, model, {
      enableImageGeneration,
      enableWebSearch
    })

    let assistantMessage = responseData.choices[0]?.message?.content
    const generatedImages = responseData.choices[0]?.message?.images

    if (!assistantMessage && !generatedImages) {
      throw new Error('No response from OpenRouter')
    }

    // If image generation is enabled and images are present, suppress text message
    if (enableImageGeneration && generatedImages && generatedImages.length > 0) {
      assistantMessage = ''
    }

    const response = {
      message: assistantMessage || '',
      usage: responseData.usage,
      model: responseData.model
    }

    // Include generated images if present
    if (generatedImages && generatedImages.length > 0) {
      response.images = generatedImages
    }

    // Include cache information if available (for monitoring/debugging)
    if (responseData.usage) {
      response.cacheInfo = {
        cached_tokens: responseData.usage.prompt_tokens_details?.cached_tokens || 0,
        cache_hit: (responseData.usage.prompt_tokens_details?.cached_tokens || 0) > 0
      }
    }

    res.json(response)

  } catch (error) {
    console.error('Chat API error:', error.response?.data || error.message)

    // If upstream provided a message, pass it through with the same status
    if (error.response) {
      const status = error.response.status || 500
      const upstream = error.response.data
      const message = (upstream && (upstream.error?.message || upstream.error || upstream.message)) || 'Request failed'
      return res.status(status).json({ error: message })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Handle streaming chat request
 */
async function handleStreamChat(req, res, uploadsDir) {
  try {
    const { 
      messages, 
      model = 'anthropic/claude-3-haiku:beta', 
      enableImageGeneration = false, 
      enableWebSearch = false 
    } = req.body

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control')

    // Format messages for OpenRouter
    const openRouterMessages = formatMessagesForOpenRouter(
      messages, 
      uploadsDir, 
      enableImageGeneration
    )

    // If image generation is enabled, most providers do not support streaming
    if (enableImageGeneration) {
      const response = await sendChatRequest(openRouterMessages, model, {
        enableImageGeneration,
        enableWebSearch
      })

      const assistantMessage = response.choices[0]?.message?.content
      const images = response.choices[0]?.message?.images

      // If images are present, suppress any refusal/placeholder text
      if (images && images.length > 0) {
        res.write(`data: ${JSON.stringify({ images })}\n\n`)
      }
      else if (assistantMessage) {
        res.write(`data: ${JSON.stringify({ content: assistantMessage })}\n\n`)
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      return res.end()
    }

    // Make streaming request to OpenRouter for text streaming
    const response = await sendStreamRequest(openRouterMessages, model, {
      enableImageGeneration,
      enableWebSearch
    })

    let buffer = ''
    let isCompleted = false

    response.data.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            isCompleted = true
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
            res.end()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            const images = parsed.choices?.[0]?.delta?.images
            
            if (delta) {
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`)
            }
            
            // Send generated images if present
            if (images && images.length > 0) {
              res.write(`data: ${JSON.stringify({ images: images })}\n\n`)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    })

    response.data.on('end', () => {
      if (!isCompleted) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
        res.end()
      }
    })

    response.data.on('error', (error) => {
      console.error('Streaming error:', error)
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
      res.end()
    })

    // Handle client disconnect
    req.on('close', () => {
      if (response.data) {
        response.data.destroy()
      }
    })

  } catch (error) {
    console.error('Streaming API error:', error.response?.data || error.message)

    if (error.response) {
      const status = error.response.status || 500
      const upstream = error.response.data
      const message = (upstream && (upstream.error?.message || upstream.error || upstream.message)) || 'Request failed'
      return res.status(status).json({ error: message })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Handle suggestions request
 */
async function handleSuggestions(req, res) {
  try {
    const { messages } = req.body

    const suggestions = await generateSuggestions(messages)
    res.json({ suggestions })

  } catch (error) {
    console.error('Suggestions API error:', error.response?.data || error.message)
    // Return empty suggestions on error rather than failing
    res.json({ suggestions: [] })
  }
}

module.exports = {
  handleChat,
  handleStreamChat,
  handleSuggestions
}

