const path = require('path')
const { extractFileContent } = require('../services/documentService')
const { optimizeImage } = require('../services/imageService')

/**
 * Handle file upload
 */
async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = req.file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    
    // Extract text from documents
    const extractedText = await extractFileContent(file)

    // Optimize images
    if (file.mimetype.startsWith('image/')) {
      await optimizeImage(file.path)
    }

    res.json({
      success: true,
      file: {
        id: path.parse(file.filename).name,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        extractedText: extractedText
      }
    })
  } catch (error) {
    console.error('File upload error:', error)
    res.status(500).json({ error: 'File upload failed' })
  }
}

module.exports = { handleUpload }

