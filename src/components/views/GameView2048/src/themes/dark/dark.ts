import { Theme } from '../types';
import defaultTheme from '../default';
import { defaultPalette } from '../default/default';

const theme: Theme = {
  ...defaultTheme,
  palette: {
    ...defaultPalette,
    primary: '#ec9050',
    secondary: '#222831',
    tertiary: '#4c5f7a',
    foreground: '#ffffff',
    background: '#000000',
    backdrop: '#000000',
    tile2: '#e0e0e0',
    tile4: '#e0e0c0',
    tile8: '#f0b080',
    tile16: '#f09060',
    tile32: '#f07050',
    tile64: '#f05030',
    tile128: '#e0c070',
    tile256: '#e0c060',
    tile512: '#e0c050',
    tile1024: '#e0c030',
    tile2048: '#e0c010',
  },
};

export default theme;
