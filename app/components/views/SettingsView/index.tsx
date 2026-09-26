import { useCallback, useMemo } from "react";

import { defineView } from "@/components/views/defineView";
import { getConditionalOption } from "@/components/SelectableList";
import { SelectableListOption } from "@/components/SelectableList";
import SelectableListView from "@/components/SelectableListView";
import { SplitScreenPreview } from "@/components/previews";
import {
  useAudioPlayer,
  useMusicKit,
  useSettings,
  useSignInOptions,
  useSpotifySDK,
  useViewContext,
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

const _SettingsView = () => {
  const {
    isAuthorized,
    isAppleAuthorized,
    isSpotifyAuthorized,
    isOffline,
    service,
    deviceTheme,
    setDeviceTheme,
    shuffleMode,
    repeatMode,
    hapticsEnabled,
    setHapticsEnabled,
  } = useSettings();
  const { setShuffleMode, setRepeatMode } = useAudioPlayer();
  const { signIn: signInWithApple, signOut: signOutApple } = useMusicKit();
  const { signOut: signOutSpotify, signIn: signInWithSpotify } =
    useSpotifySDK();
  const signInOptions = useSignInOptions();
  const { reset } = useAudioPlayer();
  const { showPopup } = useViewContext();

  const createResetHandler = useCallback(
    (handler: () => void | Promise<void>) => () => {
      reset();
      handler();
    },
    [reset]
  );

  const createSignOutHandler = useCallback(
    (serviceName: string, handler: () => void | Promise<void>) => async () => {
      reset();
      await handler();
      showPopup({
        title: "Signed Out",
        description: `You have been signed out of ${serviceName}.`,
      });
    },
    [reset, showPopup]
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

  const signOutOptions: SelectableListOption[] = useMemo(
    () => [
      ...getConditionalOption(isAppleAuthorized, {
        type: "action",
        label: SERVICE_LABELS.apple,
        onSelect: createSignOutHandler(SERVICE_LABELS.apple, signOutApple),
      }),
      ...getConditionalOption(isSpotifyAuthorized, {
        type: "action",
        label: SERVICE_LABELS.spotify,
        onSelect: createSignOutHandler(SERVICE_LABELS.spotify, signOutSpotify),
      }),
    ],
    [
      isAppleAuthorized,
      isSpotifyAuthorized,
      createSignOutHandler,
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
      ...getConditionalOption(isAuthorized && !isOffline, {
        type: "actionSheet",
        label: "Choose service",
        listOptions: serviceOptions,
        preview: SplitScreenPreview.Service,
      }),
      /** Add shuffle mode options */
      ...getConditionalOption(isAuthorized, {
        type: "actionSheet",
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
        label: "Device theme",
        listOptions: themeOptions,
        preview: SplitScreenPreview.Theme,
      },
      {
        type: "actionSheet",
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
      ...getConditionalOption(!!signInOptions, {
        type: "actionSheet",
        label: "Sign in",
        listOptions: signInOptions ?? [],
        preview: SplitScreenPreview.Music,
      }),
      /** Show the signout option for any services that are authenticated. */
      ...getConditionalOption(isAuthorized && !isOffline, {
        type: "actionSheet",
        label: "Sign out",
        listOptions: signOutOptions,
        preview: SplitScreenPreview.Service,
      }),
    ],
    [
      isAuthorized,
      isOffline,
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

  return <SelectableListView viewId="settings" options={options} />;
};

export const SettingsView = Object.assign(_SettingsView, {
  viewConfig: defineView({
    component: _SettingsView,
    type: "split",
    title: "Settings",
    isSplitScreen: true,
    preview: SplitScreenPreview.Settings,
  }),
});
