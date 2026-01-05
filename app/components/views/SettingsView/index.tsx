import { useCallback, useMemo } from "react";

import { getConditionalOption } from "@/components/SelectableList";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import {
  useAudioPlayer,
  useMenuHideView,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
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
    shuffleMode,
    repeatMode,
    hapticsEnabled,
    setHapticsEnabled,
  } = useSettings();
  const { setShuffleMode, setRepeatMode } = useAudioPlayer();
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
      /** Add shuffle mode options */
      ...getConditionalOption(isAuthorized, {
        type: "actionSheet",
        id: "shuffle-mode-action-sheet",
        label: "Shuffle",
        listOptions: [
          {
            type: "action",
            isSelected: shuffleMode === "off",
            label: `Off ${shuffleMode === "off" ? "(Current)" : ""}`,
            onSelect: () => setShuffleMode("off"),
          },
          {
            type: "action",
            isSelected: shuffleMode === "songs",
            label: `Songs ${shuffleMode === "songs" ? "(Current)" : ""}`,
            onSelect: () => setShuffleMode("songs"),
          },
          {
            type: "action",
            isSelected: shuffleMode === "albums",
            label: `Albums ${shuffleMode === "albums" ? "(Current)" : ""}`,
            onSelect: () => setShuffleMode("albums"),
          },
        ],
        preview: SplitScreenPreview.Settings,
      }),
      /** Add repeat mode options */
      ...getConditionalOption(isAuthorized, {
        type: "actionSheet",
        id: "repeat-mode-action-sheet",
        label: "Repeat",
        listOptions: [
          {
            type: "action",
            isSelected: repeatMode === "off",
            label: `Off ${repeatMode === "off" ? "(Current)" : ""}`,
            onSelect: () => setRepeatMode("off"),
          },
          {
            type: "action",
            isSelected: repeatMode === "one",
            label: `One ${repeatMode === "one" ? "(Current)" : ""}`,
            onSelect: () => setRepeatMode("one"),
          },
          {
            type: "action",
            isSelected: repeatMode === "all",
            label: `All ${repeatMode === "all" ? "(Current)" : ""}`,
            onSelect: () => setRepeatMode("all"),
          },
        ],
        preview: SplitScreenPreview.Settings,
      }),
      {
        type: "actionSheet",
        id: "device-theme-action-sheet",
        label: "Device theme",
        listOptions: themeOptions,
        preview: SplitScreenPreview.Theme,
      },
      {
        type: "actionSheet",
        id: "haptics-action-sheet",
        label: "Haptic feedback",
        listOptions: [
          {
            type: "action",
            isSelected: hapticsEnabled,
            label: `On ${hapticsEnabled ? "(Current)" : ""}`,
            onSelect: () => setHapticsEnabled(true),
          },
          {
            type: "action",
            isSelected: !hapticsEnabled,
            label: `Off ${!hapticsEnabled ? "(Current)" : ""}`,
            onSelect: () => setHapticsEnabled(false),
          },
        ],
        preview: SplitScreenPreview.Settings,
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
    [
      isAuthorized,
      serviceOptions,
      themeOptions,
      signInOptions,
      signOutOptions,
      shuffleMode,
      setShuffleMode,
      repeatMode,
      setRepeatMode,
      hapticsEnabled,
      setHapticsEnabled,
    ]
  );

  const [scrollIndex] = useScrollHandler("settings", options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
