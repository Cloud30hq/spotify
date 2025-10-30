// api/spotify.js
import querystring from "querystring";

export default async function handler(req, res) {
  const { action, trackUri } = req.query;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  // STEP 1: Get new access token using the refresh token
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return res.status(400).json({ error: "Failed to refresh token", details: tokenData });
  }

  const accessToken = tokenData.access_token;

  // STEP 2: Handle actions
  try {
    let spotifyResponse;

    if (action === "play") {
      spotifyResponse = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });
    } else if (action === "pause") {
      spotifyResponse = await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else if (action === "next") {
      spotifyResponse = await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else if (action === "previous") {
      spotifyResponse = await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else {
      return res.status(400).json({ error: "Unknown action" });
    }

    if (!spotifyResponse.ok) {
      const error = await spotifyResponse.json();
      return res.status(spotifyResponse.status).json({ error });
    }

    return res.status(200).json({ success: true, action });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}