import { getRootAppUrl } from "utils";
import { API_URL } from "utils/constants/api";
import { SELECTED_SERVICE_KEY } from "utils/service";

export type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
};

/**
 * Accepts a code returned from a Spotify OAuth login and sends it to the API to be exchanged for an access token
 */
export const handleSpotifyCode = async (code: string) => {
  try {
    await fetch(`${API_URL}/spotify/callback?code=${code}`);

    localStorage.setItem(SELECTED_SERVICE_KEY, "spotify");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

export const checkShouldRefreshSpotifyTokens = (
  lastRefreshedTimestamp: number | undefined
) => {
  if (!lastRefreshedTimestamp) {
    return true;
  }

  const lastRefreshDate = new Date(lastRefreshedTimestamp).valueOf();
  const now = Date.now();

  const millisecondDiff = now - lastRefreshDate;
  const millisecondsInMinute = 60 * 1000;
  const minuteDiff = Math.trunc(millisecondDiff / millisecondsInMinute);
  console.log(`Last token refresh: ${minuteDiff} minutes ago`);

  return minuteDiff > 30;
};

export const getRefreshedSpotifyTokens = async (
  refreshToken?: string
): Promise<TokenResponse> => {
  const emptyReturnValue = {
    accessToken: undefined,
    refreshToken: undefined,
  };

  if (!refreshToken) {
    console.error("getRefreshedSpotifyTokens: No stored refresh token found");

    return emptyReturnValue;
  }

  try {
    const url = `${getRootAppUrl()}/ipod/api/spotify/refresh?refresh_token=${refreshToken}`;
    const response = await fetch(url, {
      credentials: "same-origin",
      mode: "cors",
    });

    if (!response.ok) {
      console.error("Error fetching refresh token:", {
        url,
        status: response.status,
        statusText: response.statusText,
      });

      return emptyReturnValue;
    }
    const { accessToken } = await response.json();

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Uncaught error during refresh token fetching", { error });

    return emptyReturnValue;
  }
};

export const logOutSpotify = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/spotify/logout`);
  } catch (error) {
    console.error("Error logging out:", { error });
  }
};
