const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')

/**
 * Configure Express middleware
 * @param {express.Application} app - Express application instance
 * @param {string} uploadsDir - Path to uploads directory
 */
function configureExpress(app, uploadsDir) {
  // Security middleware
  app.use(helmet())
  
  // CORS middleware
  app.use(cors())
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  
  // Static file serving for uploads
  app.use('/uploads', express.static(uploadsDir))
}

module.exports = { configureExpress }

