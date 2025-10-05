const multer = require('multer')

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack)

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' })
    }
    return res.status(400).json({ error: err.message })
  }

  // Handle invalid file type from custom fileFilter
  if (err && err.message === 'Invalid file type') {
    return res.status(400).json({ error: 'Invalid file type' })
  }

  // Fallback - always return JSON
  return res.status(500).json({ error: err?.message || 'Internal server error' })
}

/**
 * 404 handler for unknown routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Route not found'
  })
}

module.exports = { errorHandler, notFoundHandler }

