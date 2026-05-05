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
  return `${getRootAppUrl()}/ipod`;
};

export const setSpotifyTokens = async (accessToken: string, refreshToken: string) => {
  const value = JSON.stringify({
    accessToken,
    refreshToken,
    lastRefreshedTimestamp: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SPOTIFY_TOKENS_COOKIE_NAME, value);
};

export const getSpotifyTokens = async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SPOTIFY_TOKENS_COOKIE_NAME)?.value;

  if (!raw) {
    return {
      storedAccessToken: undefined,
      storedRefreshToken: undefined,
      lastRefreshedTimestamp: undefined,
    };
  }

  const parsed = JSON.parse(raw);
  return {
    storedAccessToken: parsed.accessToken as string | undefined,
    storedRefreshToken: parsed.refreshToken as string | undefined,
    lastRefreshedTimestamp: parsed.lastRefreshedTimestamp as number | undefined,
  };
};

export const clearSpotifyTokens = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SPOTIFY_TOKENS_COOKIE_NAME);
};
