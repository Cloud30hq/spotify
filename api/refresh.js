// /api/spotify/refresh.js
export default async function handler(req, res) {
  try {
    const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      console.log("✅ New Spotify Access Token:", data.access_token);
      return res.status(200).json({ access_token: data.access_token });
    } else {
      console.error("❌ Refresh failed:", data);
      return res.status(400).json({ error: "Failed to refresh token", data });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}