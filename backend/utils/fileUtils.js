const fs = require('fs')
const path = require('path')

/**
 * Ensure a directory exists, creating it if necessary
 * 
 * @param {string} dirPath - Path to directory
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Get the uploads directory path
 * 
 * @returns {string} Path to uploads directory
 */
function getUploadsDirectory() {
  return path.join(__dirname, '..', 'uploads')
}

module.exports = { ensureDirectoryExists, getUploadsDirectory }

