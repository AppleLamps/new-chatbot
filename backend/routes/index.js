const healthRoutes = require('./health')
const { createChatRoutes } = require('./chat')
const { createUploadRoute } = require('./upload')
const imageRoutes = require('./image')

/**
 * Register all application routes
 * @param {express.Application} app - Express application
 * @param {string} uploadsDir - Path to uploads directory
 * @param {multer.Multer} upload - Configured multer instance
 */
function registerRoutes(app, uploadsDir, upload) {
  // Health check route
  app.use(healthRoutes)

  // Chat routes
  const chatRoutes = createChatRoutes(uploadsDir)
  app.use(chatRoutes)

  // Upload route
  const uploadRoute = createUploadRoute(upload)
  app.use(uploadRoute)

  // Image generation routes
  app.use(imageRoutes)
}

module.exports = { registerRoutes }

