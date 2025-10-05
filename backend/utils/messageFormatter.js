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
    // Cache system messages, messages with attachments, and early messages with large content
    // Note: Gemini requires 1028+ tokens (Flash) or 2048+ tokens (Pro), roughly 2000+ characters
    const shouldCache = (
      (msg.role === 'system') || 
      (msg.attachments && msg.attachments.length > 0) ||  // Always cache messages with files
      (index < 3 && msg.content && msg.content.length > 2000) ||
      (msg.extractedText && msg.extractedText.length > 2000)
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
      
      // Note: We don't add extracted text here because OpenRouter will parse
      // files directly when sent using the 'file' type. This avoids duplication
      // and unnecessary token usage.
      
      // Add attachments (images and documents)
      msg.attachments.forEach(attachment => {
        const filename = attachment.url.split('/').pop()
        const filePath = path.join(uploadsDir, filename)
        
        try {
          const fileBuffer = fs.readFileSync(filePath)
          const base64File = fileBuffer.toString('base64')
          const mimeType = attachment.mimetype || 'application/octet-stream'
          const dataUrl = `data:${mimeType};base64,${base64File}`
          
          if (attachment.mimetype?.startsWith('image/')) {
            // Images use the image_url format
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            })
          } else if (attachment.mimetype === 'application/pdf' || 
                     attachment.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                     attachment.mimetype?.startsWith('text/')) {
            // PDFs and documents use the file format (OpenRouter API spec)
            contentParts.push({
              type: 'file',
              file: {
                filename: attachment.filename || filename,
                file_data: dataUrl
              }
            })
          }
        } catch (error) {
          console.error('Error reading file:', error)
          // Skip this attachment if file cannot be read
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

