/**
 * Helper function to add cache control for prompt caching
 * 
 * Models requiring explicit cache_control:
 * - Anthropic Claude: Requires cache_control, 4 breakpoint limit, 5-min TTL
 * - Google Gemini: Requires cache_control, last breakpoint used, 5-min TTL
 * 
 * Models with automatic caching (no action needed):
 * - OpenAI, Grok, Moonshot AI, Groq, DeepSeek
 * 
 * @param {Array} contentParts - Array of content parts (text, image_url, file)
 * @param {boolean} shouldCache - Whether to add cache control
 * @returns {Array} Content parts with cache control added to last text part
 */
function addCacheControl(contentParts, shouldCache = false) {
  if (!shouldCache || contentParts.length === 0) return contentParts
  
  // Add cache_control to the last text part (as per OpenRouter docs)
  const lastTextIndex = contentParts.map((p, i) => p.type === 'text' ? i : -1)
    .filter(i => i !== -1)
    .pop()
  
  if (lastTextIndex !== undefined) {
    contentParts[lastTextIndex] = {
      ...contentParts[lastTextIndex],
      cache_control: { type: 'ephemeral' }
    }
  }
  
  return contentParts
}

module.exports = { addCacheControl }

