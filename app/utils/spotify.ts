import { API_URL } from "@/utils/constants/api";

export type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
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

  return minuteDiff > 30;
};

export const getRefreshedSpotifyTokens = async (): Promise<TokenResponse> => {
  try {
    const response = await fetch(`${API_URL}/spotify/refresh`);

    if (!response.ok) {
      console.error("Error fetching refresh token:", {
        status: response.status,
        statusText: response.statusText,
      });

      return {};
    }
    const { accessToken } = await response.json();

    return { accessToken };
  } catch (error) {
    console.error("Uncaught error during refresh token fetching", { error });

    return {};
  }
};

export const logOutSpotify = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/spotify/logout`);
  } catch (error) {
    console.error("Error logging out:", { error });
  }
};
