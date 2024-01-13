import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "utils/constants/api";
import { NextRequest } from "next/server";
import { setSpotifyTokens } from "api/spotify/utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url ?? "");
  const urlSearchParams = new URLSearchParams(url.search);
  const refreshToken = urlSearchParams.get("refresh_token");

  if (!refreshToken) {
    return new Response("refresh_token param was not provided", {
      status: 400,
    });
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
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
    const tokenRefreshTimestamp = Date.now().toString();

    console.log(
      "Updated accessToken",
      accessToken,
      "refreshToken",
      refreshToken,
      "tokenRefreshTimestamp",
      tokenRefreshTimestamp
    );

    if (accessToken) {
      setSpotifyTokens(accessToken, refreshToken);

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
