const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

/**
 * Configure multer for file uploads
 * @param {string} uploadsDir - Path to uploads directory
 * @returns {multer.Multer} Configured multer instance
 */
function configureMulter(uploadsDir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
      cb(null, uniqueName)
    }
  })

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
        // Documents
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        // Text formats
        'text/plain', // TXT
        'text/markdown', // MD
        'text/csv', // CSV
        'application/json', // JSON
        'text/html', // HTML
        'application/xml', 'text/xml', // XML
        'application/rtf', 'text/rtf' // RTF
      ]
      
      // Also allow files with extensions (sometimes not properly detected)
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['md', 'txt', 'csv', 'json', 'html', 'xml', 'rtf']
      
      if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension || '')) {
        cb(null, true)
      } else {
        cb(new Error('Invalid file type'))
      }
    }
  })

  return upload
}

module.exports = { configureMulter }

