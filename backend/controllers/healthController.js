/**
 * Health check endpoint
 */
function handleHealthCheck(req, res) {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
}

module.exports = { handleHealthCheck }

