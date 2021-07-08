import * as Theme from './constants/Theme';
export type DeviceTheme = 'silver' | 'black' | 'u2';

export const getTheme = (deviceTheme: DeviceTheme) => {
  if (deviceTheme === 'silver') {
    return Theme.Silver;
  } else if (deviceTheme === 'black') {
    return Theme.Black;
  } else {
    return Theme.U2;
  }
};
