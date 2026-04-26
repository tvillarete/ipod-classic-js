import { clearSpotifyTokens } from "@/api/spotify/utils";

export async function GET() {
  await clearSpotifyTokens();

  return new Response("Logged out of Spotify", {
    status: 200,
  });
}
