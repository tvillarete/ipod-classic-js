export type Spacing =
  | 's0'
  | 's1'
  | 's2'
  | 's3'
  | 's4'
  | 's5'
  | 's6'
  | 's7'
  | 's8'
  | 's9'
  | 's10';

export type Color =
  | 'transparent'
  | 'black'
  | 'white'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'foreground'
  | 'background'
  | 'backdrop'
  | 'tile2'
  | 'tile4'
  | 'tile8'
  | 'tile16'
  | 'tile32'
  | 'tile64'
  | 'tile128'
  | 'tile256'
  | 'tile512'
  | 'tile1024'
  | 'tile2048';

export type Palette = Record<Color, string>;

export interface Theme {
  borderRadius: string;
  palette: Palette;
}

export type ThemeName = 'default' | 'dark';
