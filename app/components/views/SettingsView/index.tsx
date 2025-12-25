import { useCallback, useMemo } from "react";

import { getConditionalOption } from "@/components/SelectableList";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import {
  useMenuHideView,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
  useAudioPlayer,
} from "@/hooks";

const THEMES = ["silver", "black", "u2"] as const;

const SERVICE_LABELS = {
  apple: "Apple Music",
  spotify: "Spotify",
} as const;

const formatCurrentLabel = (label: string, isCurrent: boolean) =>
  `${label}${isCurrent ? " (Current)" : ""}`;

const getThemeLabel = (theme: (typeof THEMES)[number]) => {
  if (theme === "u2") return "U2 Edition";
  return theme.charAt(0).toUpperCase() + theme.slice(1);
};

const SettingsView = () => {
  useMenuHideView("settings");
  const {
    isAuthorized,
    isAppleAuthorized,
    isSpotifyAuthorized,
    service,
    deviceTheme,
    setDeviceTheme,
  } = useSettings();
  const {
    signIn: signInWithApple,
    signOut: signOutApple,
    isConfigured: isMkConfigured,
  } = useMusicKit();
  const { signOut: signOutSpotify, signIn: signInWithSpotify } =
    useSpotifySDK();
  const { reset } = useAudioPlayer();

  const createResetHandler = useCallback(
    (handler: () => void | Promise<void>) => () => {
      reset();
      handler();
    },
    [reset]
  );

  const themeOptions: SelectableListOption[] = useMemo(
    () =>
      THEMES.map((theme) => ({
        type: "action",
        isSelected: deviceTheme === theme,
        label: formatCurrentLabel(getThemeLabel(theme), deviceTheme === theme),
        onSelect: () => setDeviceTheme(theme),
      })),
    [deviceTheme, setDeviceTheme]
  );

  const serviceOptions: SelectableListOption[] = useMemo(
    () => [
      {
        type: "action",
        isSelected: service === "apple",
        label: formatCurrentLabel(SERVICE_LABELS.apple, service === "apple"),
        onSelect: createResetHandler(signInWithApple),
      },
      {
        type: "action",
        isSelected: service === "spotify",
        label: formatCurrentLabel(
          SERVICE_LABELS.spotify,
          service === "spotify"
        ),
        onSelect: createResetHandler(signInWithSpotify),
      },
    ],
    [service, createResetHandler, signInWithApple, signInWithSpotify]
  );

  const signInOptions: SelectableListOption[] = useMemo(
    () => [
      ...getConditionalOption(isMkConfigured, {
        type: "action",
        label: SERVICE_LABELS.apple,
        onSelect: signInWithApple,
      }),
      {
        type: "action",
        label: SERVICE_LABELS.spotify,
        onSelect: signInWithSpotify,
      },
    ],
    [isMkConfigured, signInWithApple, signInWithSpotify]
  );

  const signOutOptions: SelectableListOption[] = useMemo(
    () => [
      ...getConditionalOption(isAppleAuthorized, {
        type: "action",
        label: SERVICE_LABELS.apple,
        onSelect: createResetHandler(signOutApple),
      }),
      ...getConditionalOption(isSpotifyAuthorized, {
        type: "action",
        label: SERVICE_LABELS.spotify,
        onSelect: createResetHandler(signOutSpotify),
      }),
    ],
    [
      isAppleAuthorized,
      isSpotifyAuthorized,
      createResetHandler,
      signOutApple,
      signOutSpotify,
    ]
  );

  const options: SelectableListOption[] = useMemo(
    () => [
      {
        type: "view",
        label: "About",
        viewId: "about",
        preview: SplitScreenPreview.Settings,
      },
      /** Add an option to select between services signed into more than one. */
      ...getConditionalOption(isAuthorized, {
        type: "actionSheet",
        id: "service-type-action-sheet",
        label: "Choose service",
        listOptions: serviceOptions,
        preview: SplitScreenPreview.Service,
      }),
      {
        type: "actionSheet",
        id: "device-theme-action-sheet",
        label: "Device theme",
        listOptions: themeOptions,
        preview: SplitScreenPreview.Theme,
      },
      /** Show the sign in option if not signed into any service. */
      ...getConditionalOption(!isAuthorized, {
        type: "actionSheet",
        id: "signin-popup",
        label: "Sign in",
        listOptions: signInOptions,
        preview: SplitScreenPreview.Music,
      }),
      /** Show the signout option for any services that are authenticated. */
      ...getConditionalOption(isAuthorized, {
        type: "actionSheet",
        id: "sign-out-popup",
        label: "Sign out",
        listOptions: signOutOptions,
        preview: SplitScreenPreview.Service,
      }),
    ],
    [isAuthorized, serviceOptions, themeOptions, signInOptions, signOutOptions]
  );

  const [scrollIndex] = useScrollHandler("settings", options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
