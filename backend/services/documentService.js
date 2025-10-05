const fs = require('fs')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath)
  const pdfData = await pdfParse(dataBuffer)
  return pdfData.text
}

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} Extracted text
 */
async function extractDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

/**
 * Extract text from plain text files (TXT, MD, CSV, HTML, XML, RTF, JSON)
 * @param {string} filePath - Path to text file
 * @param {string} mimetype - MIME type of the file
 * @returns {string} Extracted text
 */
function extractText(filePath, mimetype) {
  if (mimetype === 'application/json') {
    // Format JSON for better readability
    try {
      const jsonContent = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(jsonContent)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return fs.readFileSync(filePath, 'utf-8')
    }
  }
  
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * Determine if file is a text-based file
 * @param {string} mimetype - MIME type
 * @param {string} originalname - Original filename
 * @returns {boolean} True if text-based file
 */
function isTextFile(mimetype, originalname) {
  const textMimetypes = [
    'text/plain',
    'text/markdown',
    'text/csv',
    'text/html',
    'text/xml',
    'application/xml',
    'text/rtf',
    'application/rtf',
    'application/json'
  ]
  
  const textExtensions = ['md', 'txt', 'csv', 'html', 'xml', 'rtf', 'json']
  const fileExtension = originalname.split('.').pop()?.toLowerCase()
  
  return textMimetypes.includes(mimetype) || 
         textExtensions.includes(fileExtension || '')
}

/**
 * Extract text content from uploaded file based on type
 * @param {Object} file - Multer file object
 * @returns {Promise<string|null>} Extracted text or null
 */
async function extractFileContent(file) {
  let extractedText = null
  
  if (file.mimetype === 'application/pdf') {
    // PDF processing - reference: https://openrouter.ai/docs/features/multimodal/pdfs
    // OpenRouter supports PDF files natively with automatic text extraction
    extractedText = await extractPDF(file.path)
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    extractedText = await extractDOCX(file.path)
  } else if (isTextFile(file.mimetype, file.originalname)) {
    extractedText = extractText(file.path, file.mimetype)
  }
  
  return extractedText
}

module.exports = {
  extractPDF,
  extractDOCX,
  extractText,
  isTextFile,
  extractFileContent
}

