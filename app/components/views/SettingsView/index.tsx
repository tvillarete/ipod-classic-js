import { useMemo } from "react";

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
} from "@/hooks";

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
        listOptions: [
          {
            type: "action",
            isSelected: service === "apple",
            label: `Apple Music ${service === "apple" ? "(Current)" : ""}`,
            onSelect: signInWithApple,
          },
          {
            type: "action",
            isSelected: service === "spotify",
            label: `Spotify ${service === "spotify" ? "(Current)" : ""}`,
            onSelect: signInWithSpotify,
          },
        ],
        preview: SplitScreenPreview.Service,
      }),
      {
        type: "actionSheet",
        id: "device-theme-action-sheet",
        label: "Device theme",
        listOptions: [
          {
            type: "action",
            isSelected: deviceTheme === "silver",
            label: `Silver ${deviceTheme === "silver" ? "(Current)" : ""}`,
            onSelect: () => setDeviceTheme("silver"),
          },
          {
            type: "action",
            isSelected: deviceTheme === "black",
            label: `Black ${deviceTheme === "black" ? "(Current)" : ""}`,
            onSelect: () => setDeviceTheme("black"),
          },
          {
            type: "action",
            isSelected: deviceTheme === "u2",
            label: `U2 Edition ${deviceTheme === "u2" ? "(Current)" : ""}`,
            onSelect: () => setDeviceTheme("u2"),
          },
        ],
        preview: SplitScreenPreview.Theme,
      },
      /** Show the sign in option if not signed into any service. */
      ...getConditionalOption(!isAuthorized, {
        type: "actionSheet",
        id: "signin-popup",
        label: "Sign in",
        listOptions: [
          ...getConditionalOption(isMkConfigured, {
            type: "action",
            label: "Apple Music",
            onSelect: signOutApple,
          }),
          {
            type: "action",
            label: "Spotify",
            onSelect: signInWithSpotify,
          },
        ],
        preview: SplitScreenPreview.Music,
      }),
      /** Show the signout option for any services that are authenticated. */
      ...getConditionalOption(isAuthorized, {
        type: "actionSheet",
        id: "sign-out-popup",
        label: "Sign out",
        listOptions: [
          ...getConditionalOption(isAppleAuthorized, {
            type: "action",
            label: "Apple Music",
            onSelect: signOutApple,
          }),
          ...getConditionalOption(isSpotifyAuthorized, {
            type: "action",
            label: "Spotify",
            onSelect: signOutSpotify,
          }),
        ],
        preview: SplitScreenPreview.Service,
      }),
    ],
    [
      isAuthorized,
      service,
      signInWithApple,
      signInWithSpotify,
      deviceTheme,
      isMkConfigured,
      signOutApple,
      isAppleAuthorized,
      isSpotifyAuthorized,
      signOutSpotify,
      setDeviceTheme,
    ]
  );

  const [scrollIndex] = useScrollHandler("settings", options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
