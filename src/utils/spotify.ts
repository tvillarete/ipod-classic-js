import { API_URL } from 'hooks';

const ACCESS_TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const TOKEN_TIMESTAMP_KEY = 'spotify_token_timestamp';

export type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  /** The user has signed in for the first time. */
  isNew?: boolean;
};

/** Determines if an access token has been saved at a prior time,
 * and if so, attempts to refresh the token. If no prior tokens
 * have been set, fetch a brand new one and save it to localStorage.
 */
export const getTokens = async (): Promise<TokenResponse> => {
  const { storedAccessToken, storedRefreshToken } = getExistingTokens();

  if (!storedAccessToken || !storedRefreshToken) {
    return _getNewTokens();
  }

  if (_shouldRefreshTokens()) {
    return _getRefreshedTokens(storedRefreshToken);
  }

  return {
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken,
  };
};

export const getExistingTokens = () => {
  const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
  const storedRefreshToken =
    localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;

  return {
    storedAccessToken,
    storedRefreshToken,
  };
};

export const removeExistingTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
};

/** Accepts a refresh token and returns a fresh access token.
 * Valid for 1 hour, at which point the token will expire.
 */
const _getRefreshedTokens = async (
  storedRefreshToken: string
): Promise<TokenResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/refresh_token?refresh_token=${storedRefreshToken}`,
      {
        credentials: 'same-origin',
        mode: 'cors',
      }
    );

    const { access_token: accessToken } = await response.json();

    console.log('Got refreshed tokens:', { accessToken, storedRefreshToken });

    _saveTokens(accessToken, storedRefreshToken);

    return { accessToken, refreshToken: storedRefreshToken };
  } catch (error) {
    console.error('Error fetchinng refresh token:', { error });
  }

  return {
    accessToken: undefined,
    refreshToken: undefined,
  };
};

/** Accepts a `code` and `state` generated from spotify user authorization,
 * and attempts to fetch a new access and refresh token.
 * Valid for 1 hour, at which point the access token will expire.
 */
const _getNewTokens = async (): Promise<TokenResponse> => {
  const url = new URL(window.document.URL);
  const urlParams = url.searchParams;
  const code = urlParams.get('code') ?? undefined;
  const state = urlParams.get('state') ?? undefined;

  if (!code || !state) {
    return {};
  }

  try {
    const response = await fetch(
      `${API_URL}/callback?state=${state}&code=${code}`,
      {
        credentials: 'same-origin',
        mode: 'cors',
      }
    );

    const { accessToken, refreshToken } = await response.json();

    _saveTokens(accessToken, refreshToken);

    urlParams.delete('code');
    urlParams.delete('state');

    window.history.replaceState({}, '', url.toString());

    return {
      accessToken,
      refreshToken,
      // The user signed in for the first time. We will set the current streaming service to Spotify
      isNew: true,
    };
  } catch (error) {
    console.error('error fetching token:', { error });
  }

  return {
    accessToken: undefined,
    refreshToken: undefined,
  };
};

/** Checks the last time an access token was requested.
 * If a token has never been requested, return true.
 * If the last refresh was > 30 minutes ago, return true.
 */
const _shouldRefreshTokens = () => {
  const lastRefreshTimestamp = parseInt(
    localStorage.getItem(TOKEN_TIMESTAMP_KEY) ?? ''
  );
  const now = Date.now();

  if (!lastRefreshTimestamp) {
    return true;
  }

  //Gets the time difference in minutes.
  const minuteDiff = Math.round((now - lastRefreshTimestamp) / 1000 / 60);
  console.log(`Last token refresh: ${minuteDiff} minutes ago`);

  return minuteDiff > 30;
};

const _saveTokens = (accessToken?: string, refreshToken?: string) => {
  if (!accessToken || !refreshToken) {
    console.error('Error: Attempting to save undefined tokens:', {
      accessToken,
      refreshToken,
    });

    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(TOKEN_TIMESTAMP_KEY, `${Date.now()}`);
};
