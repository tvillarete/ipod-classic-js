import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "@/utils/constants/api";
import { getSpotifyTokens, setSpotifyTokens } from "@/api/spotify/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { storedRefreshToken } = await getSpotifyTokens();

  if (!storedRefreshToken) {
    console.error("[spotify/refresh] No refresh token found in cookie");
    return NextResponse.json(
      { error: "No refresh token found in session" },
      { status: 401 }
    );
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
      console.error(
        `[spotify/refresh] Spotify rejected refresh: ${response.status} — ${errorText}`
      );
      return NextResponse.json(
        { error: `Spotify token refresh failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token ?? storedRefreshToken;

    if (accessToken) {
      await setSpotifyTokens(accessToken, refreshToken);

      return NextResponse.json(
        { accessToken },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    console.error("[spotify/refresh] Spotify returned OK but no access_token in body");
    return NextResponse.json(
      { error: "Unable to refresh access token" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[spotify/refresh] Unexpected error:", error);
    return NextResponse.json(
      { error: "Could not refresh token" },
      { status: 500 }
    );
  }
}
