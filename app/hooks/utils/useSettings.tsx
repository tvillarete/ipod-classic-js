import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ColorScheme } from "@/utils/colorScheme";
import { SELECTED_SERVICE_KEY } from "@/utils/service";
import { DeviceThemeName } from "@/utils/themes";

type StreamingService = "apple" | "spotify";
export type ShuffleMode = "off" | "songs" | "albums";
export type RepeatMode = "off" | "one" | "all";

export const VOLUME_KEY = "ipodVolume";
export const COLOR_SCHEME_KEY = "ipodColorScheme";
export const DEVICE_COLOR_KEY = "ipodSelectedDeviceTheme";
export const SHUFFLE_MODE_KEY = "ipodShuffleMode";
export const REPEAT_MODE_KEY = "ipodRepeatMode";

export interface SettingsState {
  service?: StreamingService;
  isSpotifyAuthorized: boolean;
  isAppleAuthorized: boolean;
  colorScheme: ColorScheme;
  deviceTheme: DeviceThemeName;
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
}

type SettingsContextType = [
  SettingsState,
  React.Dispatch<React.SetStateAction<SettingsState>>
];

export const SettingsContext = createContext<SettingsContextType>([
  {} as any,
  () => {},
]);

export type SettingsHook = SettingsState & {
  isAuthorized: boolean;
  setIsSpotifyAuthorized: (val: boolean) => void;
  setIsAppleAuthorized: (val: boolean) => void;
  setService: (service?: StreamingService) => void;
  setColorScheme: (colorScheme?: ColorScheme) => void;
  setDeviceTheme: (deviceTheme: DeviceThemeName) => void;
  setShuffleMode: (mode: ShuffleMode) => void;
  setRepeatMode: (mode: RepeatMode) => void;
};

export const useSettings = (): SettingsHook => {
  const [state, setState] = useContext(SettingsContext);

  const setIsSpotifyAuthorized = useCallback(
    (val: boolean) =>
      setState((prevState) => ({
        ...prevState,
        isSpotifyAuthorized: val,
      })),
    [setState]
  );

  const setIsAppleAuthorized = useCallback(
    (val: boolean) =>
      setState((prevState) => ({
        ...prevState,
        isAppleAuthorized: val,
      })),
    [setState]
  );

  const setService = useCallback(
    (service?: StreamingService) => {
      if (typeof window === "undefined") {
        return;
      }

      setState((prevState) => ({
        ...prevState,
        service,
      }));

      if (service) {
        localStorage.setItem(SELECTED_SERVICE_KEY, service);
      } else {
        localStorage.removeItem(SELECTED_SERVICE_KEY);
      }
    },
    [setState]
  );

  const setDeviceTheme = useCallback(
    (deviceTheme: DeviceThemeName) => {
      setState((prevState) => ({ ...prevState, deviceTheme }));
      localStorage.setItem(DEVICE_COLOR_KEY, deviceTheme);
    },
    [setState]
  );

  const setColorScheme = useCallback(
    (colorScheme?: ColorScheme) => {
      setState((prevState) => {
        const updatedColorScheme =
          colorScheme ?? prevState.colorScheme === "dark" ? "default" : "dark";

        localStorage.setItem(COLOR_SCHEME_KEY, `${updatedColorScheme}`);

        return {
          ...prevState,
          colorScheme: updatedColorScheme,
        };
      });
    },
    [setState]
  );

  const setShuffleMode = useCallback(
    (mode: ShuffleMode) => {
      setState((prevState) => ({ ...prevState, shuffleMode: mode }));
      localStorage.setItem(SHUFFLE_MODE_KEY, mode);
    },
    [setState]
  );

  const setRepeatMode = useCallback(
    (mode: RepeatMode) => {
      setState((prevState) => ({ ...prevState, repeatMode: mode }));
      localStorage.setItem(REPEAT_MODE_KEY, mode);
    },
    [setState]
  );

  return {
    ...state,
    isAuthorized: state.isAppleAuthorized || state.isSpotifyAuthorized,
    setIsSpotifyAuthorized,
    setIsAppleAuthorized,
    setService,
    setColorScheme,
    setDeviceTheme,
    setShuffleMode,
    setRepeatMode,
  };
};

interface Props {
  children: React.ReactNode;
}

export const SettingsProvider = ({ children }: Props) => {
  const [settingsState, setSettingsState] = useState<SettingsState>({
    isAppleAuthorized: false,
    isSpotifyAuthorized: false,
    service: undefined,
    colorScheme: "default",
    deviceTheme: "silver",
    shuffleMode: "off",
    repeatMode: "off",
  });

  const handleMount = useCallback(() => {
    setSettingsState((prevState) => ({
      ...prevState,
      service:
        (localStorage.getItem(SELECTED_SERVICE_KEY) as StreamingService) ??
        undefined,
      colorScheme:
        (localStorage.getItem(COLOR_SCHEME_KEY) as ColorScheme) ?? "default",
      deviceTheme:
        (localStorage.getItem(DEVICE_COLOR_KEY) as DeviceThemeName) ?? "silver",
      shuffleMode:
        (localStorage.getItem(SHUFFLE_MODE_KEY) as ShuffleMode) ?? "off",
      repeatMode:
        (localStorage.getItem(REPEAT_MODE_KEY) as RepeatMode) ?? "off",
    }));
  }, []);

  useEffect(() => {
    handleMount();
  }, [handleMount]);

  return (
    <SettingsContext.Provider value={[settingsState, setSettingsState]}>
      {children}
    </SettingsContext.Provider>
  );
};

export default useSettings;
