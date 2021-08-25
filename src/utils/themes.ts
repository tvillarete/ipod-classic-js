import * as Theme from './constants/Theme';

export type DeviceThemeName = 'silver' | 'black' | 'u2' | 'mnelia';

export const getTheme = (deviceTheme: DeviceThemeName): Theme.DeviceTheme => {
  switch (deviceTheme) {
    case 'black':
      return Theme.Mnelia;
    case 'u2':
      return Theme.U2;
    case 'mnelia':
      return Theme.Silver;
    default:
      return Theme.Silver;
  }
};
