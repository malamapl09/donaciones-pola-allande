// Ultra simple test endpoint
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    message: 'Simple API working!',
    timestamp: new Date().toISOString(),
    method: req.method || 'unknown'
  });
};