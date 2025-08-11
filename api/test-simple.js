export default function handler(request, response) {
  return response.status(200).json({
    name: 'Hello World!',
    time: new Date().toISOString()
  });
}