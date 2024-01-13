import { clearSpotifyTokens } from "api/spotify/utils";

export async function GET() {
  clearSpotifyTokens();

  return new Response("Logged out of Spotify", {
    status: 200,
  });
}
