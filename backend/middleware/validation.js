/**
 * Validate that messages array exists and is valid
 */
function validateMessages(req, res, next) {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: 'Messages array is required'
    })
  }

  next()
}

/**
 * Validate that API key is configured
 */
function validateApiKey(apiKey) {
  return (req, res, next) => {
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenRouter API key not configured'
      })
    }
    next()
  }
}

module.exports = { validateMessages, validateApiKey }

