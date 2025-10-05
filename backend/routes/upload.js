const express = require('express')
const { handleUpload } = require('../controllers/uploadController')

const router = express.Router()

/**
 * Factory function to create upload route with multer instance
 * @param {multer.Multer} upload - Configured multer instance
 */
function createUploadRoute(upload) {
  router.post('/api/upload', upload.single('file'), handleUpload)
  return router
}

module.exports = { createUploadRoute }

