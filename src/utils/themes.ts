import { DEVICE_COLOR_KEY } from 'hooks';

import * as Theme from './constants/Theme';

const supportedThemes = {
  silver: 'silver',
  black: 'black',
  u2: 'u2',
  mnelia: 'mnelia',
};

export type DeviceThemeName = keyof typeof supportedThemes;

export const getTheme = (deviceTheme: DeviceThemeName): Theme.DeviceTheme => {
  switch (deviceTheme) {
    case 'black':
      return Theme.Black;
    case 'u2':
      return Theme.U2;
    case 'mnelia':
      return Theme.Mnelia;
    default:
      return Theme.Silver;
  }
};

/**
 * Looks for a 'theme' query parameter in the URL.
 * If a supported theme is detected, save the theme in localStorage
 * and then remove the parameter from the URL bar as it is no longer
 * necessary to apply the theme on future page loads.
 */
export const getThemeParam = () => {
  const params = new URLSearchParams(window.location.search);

  const themeParam = params.get('theme')?.toLowerCase();

  if (!themeParam || !(themeParam in supportedThemes)) {
    return;
  }

  params.delete('theme');
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  localStorage.setItem(DEVICE_COLOR_KEY, themeParam);

  return themeParam as DeviceThemeName;
};
