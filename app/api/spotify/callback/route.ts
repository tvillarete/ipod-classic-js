import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "utils/constants/api";
import { getSpotifyRedirectUri, setSpotifyTokens } from "api/spotify/utils";
import { NextRequest } from "next/server";

type SpotifyAuthApiResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url ?? "");
  const urlSearchParams = new URLSearchParams(url.search);
  const code = urlSearchParams.get("code");

  if (!code) {
    return new Response("Error: code was not provided in query params", {
      status: 400,
    });
  }

  const spotifyRedirectUri = getSpotifyRedirectUri();

  const base64EncodedAuthorizationHeader = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        code: code as string,
        redirect_uri: spotifyRedirectUri,
        grant_type: "authorization_code",
      }),
      headers: {
        Authorization: `Basic ${base64EncodedAuthorizationHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const data: SpotifyAuthApiResponse = await response.json();

    const { access_token, refresh_token } = data;

    if (access_token) {
      console.log("access_token", access_token);

      setSpotifyTokens(access_token, refresh_token);

      return new Response(
        JSON.stringify({
          accessToken: access_token,
          refreshToken: refresh_token,
        }),
        {
          status: 200,
        }
      );
    }

    return new Response("Error: Somehow got here", {
      status: 500,
    });
  } catch (e) {
    return new Response(`Uncaught error: ${JSON.stringify(e)}`, {
      status: 500,
    });
  }
}
