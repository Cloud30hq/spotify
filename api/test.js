// api/test.js
// Purpose: Simple test endpoint to confirm Vercel API routes are working.

export default async function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "✅ API route working — /api/test is live!",
  });
}