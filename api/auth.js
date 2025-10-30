// api/auth.js
export default async function handler(req, res) {
  const scopes = process.env.SPOTIFY_SCOPES;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  // Spotify authorization endpoint
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Redirect user to Spotify's consent page
  res.redirect(authUrl);
}