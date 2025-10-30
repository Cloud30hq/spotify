// api/spotify.js
//
// This endpoint lets you perform Spotify actions (play, pause, get playlists, etc.)
// using the access_token you got from the OAuth callback.
//
// ⚠️ IMPORTANT: For now, paste your working access_token temporarily to test.
// Later we’ll store and refresh it automatically.

const ACCESS_TOKEN = "PASTE_YOUR_ACCESS_TOKEN_HERE"; // Replace this with your current access_token

export default async function handler(req, res) {
  const { action, trackUri } = req.query; // action = 'play', 'pause', etc.

  try {
    let url = "";
    let method = "";

    // 🔹 Define actions you can perform
    switch (action) {
      case "play":
        url = "https://api.spotify.com/v1/me/player/play";
        method = "PUT";
        break;

      case "pause":
        url = "https://api.spotify.com/v1/me/player/pause";
        method = "PUT";
        break;

      case "next":
        url = "https://api.spotify.com/v1/me/player/next";
        method = "POST";
        break;

      case "previous":
        url = "https://api.spotify.com/v1/me/player/previous";
        method = "POST";
        break;

      case "profile":
        url = "https://api.spotify.com/v1/me";
        method = "GET";
        break;

      default:
        return res.status(400).json({ error: "Invalid or missing action" });
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body:
        action === "play" && trackUri
          ? JSON.stringify({ uris: [trackUri] }) // Optional: play a specific song
          : undefined,
    });

    if (response.status === 204) {
      return res.status(200).json({ message: `${action} executed successfully` });
    }

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);

  } catch (error) {
    console.error("Spotify API error:", error);
    return res.status(500).json({ error: "Failed to perform Spotify action" });
  }
}