import { SPOTIFY_CLIENT_ID } from "@/utils/constants/api";
import { getSpotifyRedirectUri } from "@/api/spotify/utils";
import { v4 as uuid } from "uuid";
import { redirect } from "next/navigation";

export async function GET() {
  const scope =
    "user-read-private user-read-email user-library-read user-follow-read playlist-read-collaborative playlist-read-private streaming user-read-playback-state user-read-currently-playing user-modify-playback-state";

  const redirect_uri = getSpotifyRedirectUri();
  const client_id = SPOTIFY_CLIENT_ID;
  const state: string = uuid();

  if (!redirect_uri || !client_id) {
    return new Response(
      "Missing Spotify client ID or redirect URI. Check that the Vercel ENV variables have been properly initialized.",
      { status: 400 }
    );
  }

  const authParams = new URLSearchParams({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state,
  }).toString();

  redirect(`https://accounts.spotify.com/authorize/?${authParams}`);
}
