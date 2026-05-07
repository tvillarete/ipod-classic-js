import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "@/utils/constants/api";
import { getSpotifyTokens, setSpotifyTokens } from "@/api/spotify/utils";

export async function GET() {
  const { storedRefreshToken } = await getSpotifyTokens();

  if (!storedRefreshToken) {
    return new Response("No refresh token found in session", {
      status: 401,
    });
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: storedRefreshToken,
  });

  const base64EncodedAuthorizationHeader = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: params,
      headers: {
        Authorization: `Basic ${base64EncodedAuthorizationHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Spotify token refresh failed: ${errorText}`, {
        status: response.status,
      });
    }

    const data = await response.json();

    const accessToken = data.access_token;
    // Spotify only returns a new refresh token sometimes — preserve the existing one if absent
    const refreshToken = data.refresh_token ?? storedRefreshToken;

    if (accessToken) {
      await setSpotifyTokens(accessToken, refreshToken);

      return new Response(
        JSON.stringify({
          accessToken,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response(`Unable to refresh access token`, {
      status: 500,
    });
  } catch (error) {
    console.error("Unexpected error during Spotify token refresh:", error);
    return new Response("Could not refresh token", {
      status: 500,
    });
  }
}
