import { deleteCookie, getCookie, setCookie } from "cookies-next/server";
import { cookies } from "next/headers";
import { SPOTIFY_TOKENS_COOKIE_NAME } from "@/utils/constants/api";

/**
 * [Server-side only] Returns the root URL of the app, depending on the environment
 */
export const getRootAppUrl = () => {
  const isDev = process.env.NODE_ENV === "development";

  const protocol = isDev ? "http" : "https";
  const rootUrl = isDev ? `127.0.0.1:3000` : process.env.VERCEL_BASE_URL;

  return `${protocol}://${rootUrl}`;
};

export const getSpotifyRedirectUri = () => {
  // Example: http://127.0.0.1:3000/ipod/callback
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

export const setSpotifyTokens = async (accessToken: string, refreshToken: string) => {
  const value = JSON.stringify({
    accessToken,
    refreshToken,
    lastRefreshedTimestamp: Date.now(),
  });

  await setCookie(SPOTIFY_TOKENS_COOKIE_NAME, value, { cookies });
};

export const getSpotifyTokens = async () => {
  const raw = await getCookie(SPOTIFY_TOKENS_COOKIE_NAME, { cookies });

  if (!raw) {
    return {
      storedAccessToken: undefined,
      storedRefreshToken: undefined,
      lastRefreshedTimestamp: undefined,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      storedAccessToken: parsed.accessToken as string | undefined,
      storedRefreshToken: parsed.refreshToken as string | undefined,
      lastRefreshedTimestamp: parsed.lastRefreshedTimestamp as number | undefined,
    };
  } catch {
    // Handle legacy comma-delimited format during migration
    const [storedAccessToken, storedRefreshToken, lastRefreshedTimestamp] =
      raw.split(",");
    return {
      storedAccessToken,
      storedRefreshToken,
      lastRefreshedTimestamp: parseInt(lastRefreshedTimestamp ?? "") || undefined,
    };
  }
};

export const clearSpotifyTokens = async () => {
  await deleteCookie(SPOTIFY_TOKENS_COOKIE_NAME, {
    cookies,
  });
};
