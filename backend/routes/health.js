const express = require('express')
const { handleHealthCheck } = require('../controllers/healthController')

const router = express.Router()

router.get('/health', handleHealthCheck)

module.exports = router

