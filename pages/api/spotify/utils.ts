import type { NextApiResponse } from "next";
import { serialize, CookieSerializeOptions } from "cookie";

export const getSpotifyClientId = () => {
  if (process.env.SPOTIFY_CLIENT_ID) {
    return process.env.SPOTIFY_CLIENT_ID;
  } else {
    console.error(
      "Undefined Error: An environment variable - SPOTIFY_CLIENT_ID - is not working properly"
    );
  }
};

export const getSpotifyClientSecret = () => {
  if (process.env.SPOTIFY_CLIENT_SECRET) {
    return process.env.SPOTIFY_CLIENT_SECRET;
  } else {
    console.error(
      "Undefined Error: An environment variable - SPOTIFY_CLIENT_SECRET - is not working properly"
    );
  }
};

export const getSpotifyRedirectUri = () => {
  return process.env.VERCEL_ENV === "development"
    ? `http://${process.env.VERCEL_URL}/api/spotify/callback`
    : `https://${process.env.VERCEL_URL}/api/spotify/callback`;
};

export const getSpotifyAuthorizationHeader = (
  clientId?: string,
  clientSecret?: string
) => {
  if (!clientId || !clientSecret) {
    console.error(
      "getSpotifyAuthorizationHeader: clientId or clientSecret is undefined"
    );
  }

  return (
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
  );
};

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown
) => {
  const stringValue =
    typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);

  const options: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    path: "/",
  };

  res.setHeader("Set-Cookie", serialize(name, stringValue, options));
};

export const clearCookie = (res: NextApiResponse, name: string) => {
  const options: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: -1,
  };

  res.setHeader("Set-Cookie", serialize(name, "", options));
};
