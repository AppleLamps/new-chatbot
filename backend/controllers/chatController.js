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
    let contentBuffer = ''
    let lastFlushTime = Date.now()
    const FLUSH_INTERVAL_MS = 50 // Batch updates every 50ms for smoother streaming

    const flushContentBuffer = () => {
      if (contentBuffer) {
        res.write(`data: ${JSON.stringify({ content: contentBuffer })}\n\n`)
        contentBuffer = ''
        lastFlushTime = Date.now()
      }
    }

    response.data.on('data', (chunk) => {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        // Handle SSE data events
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()

          // Skip empty data
          if (!data) continue

          if (data === '[DONE]') {
            flushContentBuffer() // Flush any remaining content
            isCompleted = true
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
            res.end()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            const images = parsed.choices?.[0]?.delta?.images

            // Buffer content for batched sending
            if (delta) {
              contentBuffer += delta

              // Flush if enough time has passed or buffer is getting large
              const timeSinceLastFlush = Date.now() - lastFlushTime
              if (timeSinceLastFlush >= FLUSH_INTERVAL_MS || contentBuffer.length > 100) {
                flushContentBuffer()
              }
            }

            // Send generated images immediately (not buffered)
            if (images && images.length > 0) {
              flushContentBuffer() // Flush any pending content first
              res.write(`data: ${JSON.stringify({ images: images })}\n\n`)
            }
          } catch (e) {
            // Skip invalid JSON (could be SSE comments or malformed data)
          }
        }
        // Handle SSE comments (OpenRouter sends these to prevent timeouts)
        else if (line.startsWith(':')) {
          // Forward comments to client (optional, helps with connection keep-alive)
          res.write(`${line}\n`)
        }
      }
    })

    response.data.on('end', () => {
      if (!isCompleted) {
        flushContentBuffer() // Flush any remaining buffered content
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

