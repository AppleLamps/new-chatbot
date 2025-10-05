const express = require('express')
const { configureExpress } = require('./config/express')
const { configureMulter } = require('./config/multer')
const { apiLimiter } = require('./middleware/rateLimiter')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const { registerRoutes } = require('./routes')
const { ensureDirectoryExists, getUploadsDirectory } = require('./utils/fileUtils')

/**
 * Create and configure Express application
 * @returns {express.Application} Configured Express app
 */
function createApp() {
  const app = express()

  // Ensure uploads directory exists
  const uploadsDir = getUploadsDirectory()
  ensureDirectoryExists(uploadsDir)

  // Configure Express middleware
  configureExpress(app, uploadsDir)

  // Configure multer for file uploads
  const upload = configureMulter(uploadsDir)

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter)

  // Register all application routes
  registerRoutes(app, uploadsDir, upload)

  // Error handling middleware (must be last)
  app.use(errorHandler)
  
  // 404 handler (must be after all other routes)
  app.use('*', notFoundHandler)

  return app
}

module.exports = { createApp }

