import { Palette, Theme } from '../types';

export const defaultPalette: Palette = {
  transparent: 'transparent',
  black: '#000000',
  white: '#ffffff',
  primary: '#776e65',
  secondary: '#bbada0',
  tertiary: '#eee4da',
  foreground: '#ffffff',
  background: '#ffffff',
  backdrop: '#edc22e',
  tile2: '#eeeeee',
  tile4: '#eeeecc',
  tile8: '#ffbb88',
  tile16: '#ff9966',
  tile32: '#ff7755',
  tile64: '#ff5533',
  tile128: '#eecc77',
  tile256: '#eecc66',
  tile512: '#eecc55',
  tile1024: '#eecc33',
  tile2048: '#eecc11',
};

const theme: Theme = {
  borderRadius: '3px',
  palette: defaultPalette,
};

export default theme;
