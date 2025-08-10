// Ultra minimal test - no dependencies
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Minimal API working',
    timestamp: new Date().toISOString()
  });
};