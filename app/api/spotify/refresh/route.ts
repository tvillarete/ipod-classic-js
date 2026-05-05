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
    const response = await fetch(
      `https://accounts.spotify.com/api/token?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64EncodedAuthorizationHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const data = await response.json();

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

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
    return new Response(`Could not refresh token: ${error}`, {
      status: 500,
    });
  }
}
