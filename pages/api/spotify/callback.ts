import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

import {
  getSpotifyClientId,
  getSpotifyClientSecret,
  getSpotifyRedirectUri,
  setCookie,
} from "pages/api/spotify/utils";

type SpotifyAuthApiResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

const callback = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code;

  const spotify_redirect_uri = getSpotifyRedirectUri();
  const spotify_client_id = getSpotifyClientId();
  const spotify_client_secret = getSpotifyClientSecret();

  const params = new URLSearchParams({
    code: code as string,
    redirect_uri: spotify_redirect_uri,
    grant_type: "authorization_code",
  });

  const options = {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axios.post<SpotifyAuthApiResponse>(
      "https://accounts.spotify.com/api/token",
      params,
      options
    );

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    if (response.data.access_token) {
      // Concatenate the two tokens into a single string separated by a comma
      setCookie(res, "spotify-tokens", `${accessToken},${refreshToken}`);

      res.status(200).redirect("/?service=spotify");
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ error: "Error retrieving Spotify tokens" });
  }
};

export default callback;
