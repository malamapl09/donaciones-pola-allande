// Basic hello world endpoint
export default function handler(req, res) {
  return res.status(200).json({
    message: 'Hello from Vercel!',
    time: new Date().toISOString()
  });
}