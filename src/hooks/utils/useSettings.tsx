import { createContext, memo, useCallback, useContext, useState } from 'react';

import { DeviceThemeName, getThemeParam } from '../../utils/themes';

type StreamingService = 'apple' | 'spotify';

export const SELECTED_SERVICE_KEY = 'ipodSelectedService';
export const DEVICE_COLOR_KEY = 'ipodSelectedDeviceTheme';
export const VOLUME_KEY = 'ipodVolume';

export interface SettingsState {
  service?: StreamingService;
  isSpotifyAuthorized: boolean;
  isAppleAuthorized: boolean;
  deviceTheme: DeviceThemeName;
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
  setDeviceTheme: (deviceTheme: DeviceThemeName) => void;
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

  return {
    ...state,
    isAuthorized: state.isAppleAuthorized || state.isSpotifyAuthorized,
    setIsSpotifyAuthorized,
    setIsAppleAuthorized,
    setService,
    setDeviceTheme,
  };
};

interface Props {
  children: React.ReactNode;
}

export const SettingsProvider = memo(({ children }: Props) => {
  const themeParam = getThemeParam();

  const [settingsState, setSettingsState] = useState<SettingsState>({
    isAppleAuthorized: false,
    isSpotifyAuthorized: false,
    service:
      (localStorage.getItem(SELECTED_SERVICE_KEY) as StreamingService) ??
      undefined,
    deviceTheme:
      themeParam ??
      (localStorage.getItem(DEVICE_COLOR_KEY) as DeviceThemeName) ??
      'silver',
  });

  return (
    <SettingsContext.Provider value={[settingsState, setSettingsState]}>
      {children}
    </SettingsContext.Provider>
  );
});

export default useSettings;
