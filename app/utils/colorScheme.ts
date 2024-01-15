const defaultColorTheme = {
  red: "#FF3B30",
  orange: "#FF9500",
  yellow: "#FFCC00",
  green: "#34C759",
  mint: "#00C7BE",
  teal: "#30B0C7",
  cyan: "#32ADE6",
  blue: "#007AFF",
  indigo: "#5856D6",
  purple: "#AF52DE",
  pink: "#FF2D55",
  brown: "#A2845E",
  black: "#000000",
  grey: "#8E8E93",
  grey2: "#AEAEB2",
  grey3: "#C7C7CC",
  grey4: "#D1D1D6",
  grey5: "#E5E5EA",
  grey6: "#F2F2F7",
  white: "#FFFFFF",
  background: {
    primary: "#FFFFFF",
    secondary: "#F2F2F7",
    tertiary: "#FFFFFF",
  },
  content: {
    primary: " rgba(0, 0, 0, 1)",
    secondary: "rgba(60, 60, 67, 0.6)",
    tertiary: "rgba(60, 60, 67, 0.3)",
    quaternary: "rgba(60, 60, 67, 0.1)",
  },
  border: {
    opaque: "#C6C6C8",
    nonOpaque: "#3C3C4336",
  },
};

type ColorTheme = typeof defaultColorTheme;

const darkColorTheme: ColorTheme = {
  red: "#FF453A",
  orange: "#FF9F0A",
  yellow: "#FFD60A",
  green: "#30D158",
  mint: "#63E6E2",
  teal: "#40CBE0",
  cyan: "#64D2FF",
  blue: "#0A84FF",
  indigo: "#5E5CE6",
  purple: "#BF5AF2",
  pink: "#FF375F",
  brown: "#AC8E68",
  black: "#000000",
  grey: "#8E8E93",
  grey2: "#636366",
  grey3: "#48484A",
  grey4: "#3A3A3C",
  grey5: "#2C2C2E",
  grey6: "#1C1C1E",
  white: "#FFFFFF",
  background: {
    primary: "#000000",
    secondary: "#1C1C1E",
    tertiary: "#2C2C2E",
  },
  content: {
    primary: "rgba(255, 255, 255, 1)",
    secondary: "rgba(235, 235, 245, 0.6)",
    tertiary: "rgba(235, 235, 245, 0.3)",
    quaternary: "rgba(235, 235, 245, 0.1)",
  },
  border: {
    opaque: "#38383A",
    nonOpaque: "#3C3C4336",
  },
};

const colorThemes = {
  default: defaultColorTheme,
  dark: darkColorTheme,
};

export type ColorScheme = "default" | "dark";

export type ThemeConstants = {
  colors: ColorTheme;
};

export const getThemeConstants = (mode: ColorScheme): ThemeConstants => ({
  colors: colorThemes[mode],
});

export const getColorSchemeDisplayName = (mode: ColorScheme) => {
  switch (mode) {
    case "default":
      return "Light";
    case "dark":
      return "Dark";
  }
};
