import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "@/utils/constants/api";
import { getSpotifyRedirectUri, setSpotifyTokens } from "@/api/spotify/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response("Error: code was not provided in query params", {
      status: 400,
    });
  }

  const base64Auth = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        code,
        redirect_uri: getSpotifyRedirectUri(),
        grant_type: "authorization_code",
      }),
      headers: {
        Authorization: `Basic ${base64Auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data = await response.json();

    if (data.access_token) {
      await setSpotifyTokens(data.access_token, data.refresh_token);
      return new Response(null, { status: 200 });
    }

    return new Response("Error: failed to obtain access token from Spotify", {
      status: 500,
    });
  } catch (e) {
    return new Response(`Uncaught error: ${JSON.stringify(e)}`, {
      status: 500,
    });
  }
}
