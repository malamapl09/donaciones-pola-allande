// Ultra minimal test - no dependencies
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Minimal API working',
    timestamp: new Date().toISOString()
  });
}