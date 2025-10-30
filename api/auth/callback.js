// api/auth/callback.js

export default async function handler(req, res) {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Spotify token error:', data);
      return res.status(400).json({ error: data.error });
    }

    // Return tokens if successful
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });

  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}