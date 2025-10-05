const fs = require('fs')
const path = require('path')
const { addCacheControl } = require('./cacheControl')

/**
 * Format messages for OpenRouter API with multimodal support and caching
 * 
 * @param {Array} messages - Array of message objects
 * @param {string} uploadsDir - Path to uploads directory
 * @param {boolean} enableImageGeneration - Whether image generation is enabled
 * @returns {Array} Formatted messages for OpenRouter
 */
function formatMessagesForOpenRouter(messages, uploadsDir, enableImageGeneration = false) {
  // For image generation, send only the latest user prompt as a plain string
  if (enableImageGeneration) {
    const lastUser = [...messages].reverse().find(m => m.role === 'user') || messages[messages.length - 1]
    return [{ role: 'user', content: lastUser?.content || '' }]
  }

  return messages.map((msg, index) => {
    // Determine if this message should be cached
    // Cache system messages and early messages with large content (>1000 chars)
    const shouldCache = (
      (msg.role === 'system') || 
      (index < 3 && msg.content && msg.content.length > 1000) ||
      (msg.extractedText && msg.extractedText.length > 1000)
    )
    
    // If message has attachments (images or documents), format as multimodal content
    if (msg.attachments && msg.attachments.length > 0) {
      const contentParts = []
      
      // Add text content first (recommended by OpenRouter docs)
      if (msg.content) {
        contentParts.push({
          type: 'text',
          text: msg.content
        })
      }
      
      // Add extracted text from documents (should be cached for large documents)
      if (msg.extractedText) {
        contentParts.push({
          type: 'text',
          text: `[Uploaded Document Content]\n${msg.extractedText}`
        })
      }
      
      // Add image attachments as base64 data URLs
      msg.attachments.forEach(attachment => {
        if (attachment.mimetype?.startsWith('image/')) {
          // Convert local file path to base64 data URL for OpenRouter
          // OpenRouter cannot access localhost URLs, so we need to encode the image
          const filename = attachment.url.split('/').pop()
          const filePath = path.join(uploadsDir, filename)
          
          try {
            const imageBuffer = fs.readFileSync(filePath)
            const base64Image = imageBuffer.toString('base64')
            const mimeType = attachment.mimetype || 'image/jpeg'
            const dataUrl = `data:${mimeType};base64,${base64Image}`
            
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            })
          } catch (error) {
            console.error('Error reading image file:', error)
            // Skip this attachment if file cannot be read
          }
        }
      })
      
      return {
        role: msg.role,
        content: addCacheControl(contentParts, shouldCache)
      }
    }
    
    // Handle system messages or messages with large content
    if (shouldCache) {
      const contentParts = [
        {
          type: 'text',
          text: msg.content
        }
      ]
      
      return {
        role: msg.role,
        content: addCacheControl(contentParts, true)
      }
    }
    
    // Standard text-only message (no caching needed)
    return {
      role: msg.role,
      content: msg.content
    }
  })
}

module.exports = { formatMessagesForOpenRouter }

