// api/auth.js
import axios from "axios";

// This route handles the Spotify OAuth flow and token exchange.
// It helps you generate your REFRESH_TOKEN once, which you’ll save in .env.

export default async function handler(req, res) {
  const { code } = req.query;

  // Step 1: If no code provided, redirect user to Spotify login page
  if (!code) {
    const authURL = new URL("https://accounts.spotify.com/authorize");
    authURL.searchParams.append("client_id", process.env.SPOTIFY_CLIENT_ID);
    authURL.searchParams.append("response_type", "code");
    authURL.searchParams.append("redirect_uri", process.env.SPOTIFY_REDIRECT_URI);
    authURL.searchParams.append("scope", [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-library-modify",
      "user-library-read",
      "user-top-read",
    ].join(" "));
    authURL.searchParams.append("show_dialog", "true");

    return res.redirect(authURL.toString());
  }

  // Step 2: If we have the code, exchange it for a refresh token
  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    return res.status(200).json({
      success: true,
      message: "Authorization successful! Copy your REFRESH_TOKEN below and save it in your .env file.",
      refresh_token,
      access_token,
    });
  } catch (error) {
    console.error("Auth error:", error.response?.data || error.message);
    return res.status(400).json({
      success: false,
      message: "Authorization failed",
      error: error.response?.data || error.message,
    });
  }
}