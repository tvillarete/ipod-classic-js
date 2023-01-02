import type { NextApiRequest, NextApiResponse } from "next";
import { clearCookie } from "pages/api/spotify/utils";

const logout = async (_req: NextApiRequest, res: NextApiResponse) => {
  clearCookie(res, "spotify-tokens");

  res.status(200).redirect("/");
};

export default logout;
