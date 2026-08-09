import { getCloudflareContext } from "@opennextjs/cloudflare";

export const APP_URL = "/ipod";
export const API_URL = `${APP_URL}/api`;

export const SPOTIFY_TOKENS_COOKIE_NAME = "ipod-spotify-tokens";
export const DEFAULT_ARTWORK_URL = `${APP_URL}/default_album_artwork.png`;

export async function getSpotifyClientId() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as any).SPOTIFY_CLIENT_ID.get() as Promise<string>;
}

export async function getSpotifyClientSecret() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as any).SPOTIFY_CLIENT_SECRET.get() as Promise<string>;
}

export async function getAppleDeveloperToken() {
  const { env } = await getCloudflareContext({ async: true });
  return (env as any).APPLE_DEVELOPER_TOKEN.get() as Promise<string>;
}
