import type { NextApiRequest, NextApiResponse } from "next";
import {
  getSpotifyClientId,
  getSpotifyRedirectUri,
} from "pages/api/spotify/utils";

const generateRandomString = (length: number): string => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const login = (_: NextApiRequest, res: NextApiResponse) => {
  const scope =
    "user-read-private user-read-email user-library-read user-follow-read playlist-read-collaborative playlist-read-private streaming user-read-playback-state user-read-currently-playing user-modify-playback-state";

  const spotify_redirect_uri = getSpotifyRedirectUri();
  const spotify_client_id = getSpotifyClientId();
  const state: string = generateRandomString(16);
  console.log({ spotify_redirect_uri });

  if (!spotify_redirect_uri || !spotify_client_id) {
    res.status(500).json({ error: "Missing Spotify redirect URI" });
    return;
  }

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
};

export default login;
