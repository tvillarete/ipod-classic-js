import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

import { setCookie } from 'pages/api/auth/utils';

type SpotifyAuthApiResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

const callback = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code;
  const spotify_redirect_uri = 'http://localhost:3000/api/auth/callback';

  let spotify_client_id: string = '';
  if (process.env.SPOTIFY_CLIENT_ID) {
    spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
  } else {
    console.error(
      'Undefined Error: An environmental variable, "SPOTIFY_CLIENT_ID", has something wrong.'
    );
  }

  let spotify_client_secret: string = '';
  if (process.env.SPOTIFY_CLIENT_SECRET) {
    spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  } else {
    console.error(
      'Undefined Error: An environmental variable, "SPOTIFY_CLIENT_SECRET", has something wrong.'
    );
  }

  const params = new URLSearchParams({
    code: code as string,
    redirect_uri: spotify_redirect_uri,
    grant_type: 'authorization_code',
  });

  const options = {
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString(
          'base64'
        ),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  axios
    .post<SpotifyAuthApiResponse>(
      'https://accounts.spotify.com/api/token',
      params,
      options
    )
    .then((response) => {
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      if (response.data.access_token) {
        // Concatenate the two tokens into a single string separated by a comma
        setCookie(res, 'spotify-tokens', `${accessToken},${refreshToken}`);

        res.status(200).redirect('/?service=spotify');
      }
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
};

export default callback;
