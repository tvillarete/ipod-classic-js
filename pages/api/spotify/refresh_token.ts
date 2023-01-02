import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import {
  getSpotifyAuthorizationHeader,
  getSpotifyClientId,
  getSpotifyClientSecret,
  setCookie,
} from "pages/api/spotify/utils";

const refresh_token = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = (req.query.refresh_token as string) ?? "";

  let clientId = getSpotifyClientId();
  let clientSecret = getSpotifyClientSecret();

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token,
  });

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          Authorization: getSpotifyAuthorizationHeader(clientId, clientSecret),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;

    if (accessToken) {
      setCookie(res, "spotify-tokens", accessToken);

      res.status(200).json({
        accessToken,
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

export default refresh_token;
