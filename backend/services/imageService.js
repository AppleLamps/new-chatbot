const sharp = require('sharp')
const fs = require('fs')

/**
 * Optimize an image file using Sharp
 * Resizes to max 1920x1920 while maintaining aspect ratio
 * 
 * @param {string} filePath - Path to image file
 * @returns {Promise<void>}
 */
async function optimizeImage(filePath) {
  try {
    const optimizedPath = filePath + '.optimized'
    
    await sharp(filePath)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .toFile(optimizedPath)
    
    // Replace original with optimized version
    fs.unlinkSync(filePath)
    fs.renameSync(optimizedPath, filePath)
  } catch (error) {
    console.error('Image optimization error:', error)
    // Don't throw - let the upload succeed even if optimization fails
  }
}

module.exports = { optimizeImage }

