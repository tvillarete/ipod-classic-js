import { getCloudflareContext } from "@opennextjs/cloudflare";

export const APP_URL = "/ipod";
export const API_URL = `${APP_URL}/api`;

export const SPOTIFY_TOKENS_COOKIE_NAME = "ipod-spotify-tokens";
export const DEFAULT_ARTWORK_URL = `${APP_URL}/default_album_artwork.png`;

/**
 * Reads a secret from Cloudflare env bindings.
 * Works in both production (remote Secrets Store) and local dev (local Secrets Store).
 * Seed local secrets with: `pnpm sync-dev-vars`
 */
async function getSecret(
  name: string,
  options?: { optional: true }
): Promise<string>;
async function getSecret(
  name: string,
  options: { optional: true }
): Promise<string | undefined>;
async function getSecret(
  name: string,
  options?: { optional?: boolean }
): Promise<string | undefined> {
  const { env } = await getCloudflareContext({ async: true });
  const binding = (env as Record<string, unknown>)[name];

  if (typeof binding === "string") return binding;

  if (binding && typeof (binding as any).get === "function") {
    try {
      return await (binding as { get(): Promise<string> }).get();
    } catch {
      if (options?.optional) return undefined;
      throw new Error(`Secret "${name}" not found. Run \`pnpm sync-dev-vars\` to seed local secrets.`);
    }
  }

  if (options?.optional) return undefined;
  throw new Error(`Secret "${name}" not found. Run \`pnpm sync-dev-vars\` to seed local secrets.`);
}

export function getSpotifyClientId() {
  return getSecret("SPOTIFY_CLIENT_ID");
}

export function getSpotifyClientSecret() {
  return getSecret("SPOTIFY_CLIENT_SECRET");
}

export function getAppleDeveloperToken() {
  return getSecret("APPLE_DEVELOPER_TOKEN", { optional: true });
}
