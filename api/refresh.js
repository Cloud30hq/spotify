export default async function handler(req, res) {
  try {
    const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id,
        client_secret,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: "Failed to refresh token", details: data });
    }

    // Log the new token for verification
    console.log("New access token:", data.access_token);

    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}