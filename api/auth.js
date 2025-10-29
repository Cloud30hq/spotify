// api/auth.js
// Purpose: Spotify OAuth flow (authorize user + get refresh token)

import axios from "axios";

export default async function handler(req, res) {
  const code = req.query.code;

  // Step 1: If no "code" param — redirect user to Spotify authorize page
  if (!code) {
    const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
    authorizeUrl.searchParams.append("client_id", process.env.SPOTIFY_CLIENT_ID);
    authorizeUrl.searchParams.append("response_type", "code");
    authorizeUrl.searchParams.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI);
    authorizeUrl.searchParams.append("scope", [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-read",
      "user-library-modify",
      "user-top-read"
    ].join(" "));
    authorizeUrl.searchParams.append("show_dialog", "true");

    return res.redirect(authorizeUrl.toString());
  }

  // Step 2: If "code" param is present — exchange it for tokens
  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    res.status(200).json({
      success: true,
      message:
        "✅ Authorization successful! Copy the refresh_token below and add it to your Vercel env as SPOTIFY_REFRESH_TOKEN.",
      refresh_token,
      access_token,
      expires_in,
    });
  } catch (err) {
    console.error("Spotify auth error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Token exchange failed",
      error: err.response?.data || err.message,
    });
  }
}