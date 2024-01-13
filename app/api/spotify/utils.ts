import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { cookies } from "next/headers";
import { SPOTIFY_TOKENS_COOKIE_NAME } from "utils/constants/api";

/**
 * [Server-side only] Returns the root URL of the app, depending on the environment
 */
export const getRootAppUrl = () => {
  const isDev = process.env.NODE_ENV === "development";

  const protocol = isDev ? "http" : "https";
  const rootUrl = isDev ? `localhost:3000` : process.env.VERCEL_BASE_URL;

  return `${protocol}://${rootUrl}`;
};

export const getSpotifyRedirectUri = () => {
  // Example: http://localhost:3000/ipod/callback
  return `${getRootAppUrl()}/ipod`;
};

export const getSpotifyAuthorizationHeader = (
  clientId?: string,
  clientSecret?: string
) => {
  if (!clientId || !clientSecret) {
    console.error(
      "getSpotifyAuthorizationHeader: clientId or clientSecret is undefined"
    );
  }

  return (
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
  );
};

export const setSpotifyTokens = (accessToken: string, refreshToken: string) => {
  const tokenRefreshTimestamp = Date.now().toString();

  setCookie(
    SPOTIFY_TOKENS_COOKIE_NAME,
    `${accessToken},${refreshToken},${tokenRefreshTimestamp}`,
    {
      cookies,
      sameSite: false,
    }
  );
};

export const getSpotifyTokens = () => {
  const spotifyTokens = getCookie(SPOTIFY_TOKENS_COOKIE_NAME, {
    cookies,
  });
  const [storedAccessToken, storedRefreshToken, lastRefreshedTimestamp] =
    spotifyTokens?.split(",") ?? [undefined, undefined, undefined];

  return {
    storedAccessToken,
    storedRefreshToken,
    lastRefreshedTimestamp: parseInt(lastRefreshedTimestamp ?? "") || undefined,
  };
};

export const clearSpotifyTokens = () => {
  deleteCookie(SPOTIFY_TOKENS_COOKIE_NAME, {
    cookies,
  });
};
