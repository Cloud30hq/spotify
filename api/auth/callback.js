// api/auth/callback.js
import querystring from "querystring";

export default async function handler(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return res.status(400).json({ error: tokenData.error });
  }

  // redirect or show success
  res.status(200).json({
    message: "Spotify authorization successful!",
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
  });
}