import fetch from "node-fetch";

export default async function handler(req, res) {
  const { action, trackUri } = req.query;
  
  // Stored tokens
  let access_token = process.env.SPOTIFY_ACCESS_TOKEN;
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

  // Try Spotify call
  let response = await fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });

  // If token expired
  if (response.status === 401) {
    console.log("Access token expired, refreshing...");

    // Refresh the token
    const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });

    const newTokens = await refreshResponse.json();
    access_token = newTokens.access_token;

    // Retry Spotify request with new token
    response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });
  }

  const data = await response.json();
  res.status(response.status).json(data);
}