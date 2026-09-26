import { useMemo } from "react";

import { SelectableListOption } from "@/components/SelectableList";
import { getConditionalOption } from "@/components/SelectableList";
import { useMusicKit, useSettings, useSpotifySDK } from "@/hooks";

const useSignInOptions = (): SelectableListOption[] | null => {
  const { isAuthorized, isOffline } = useSettings();
  const { signIn: signInWithApple, isConfigured: isMkConfigured } =
    useMusicKit();
  const { signIn: signInWithSpotify } = useSpotifySDK();

  return useMemo(() => {
    if (isAuthorized || isOffline) return null;

    return [
      ...getConditionalOption(isMkConfigured, {
        type: "action",
        label: "Apple Music",
        onSelect: signInWithApple,
      }),
      {
        type: "popup",
        label: "Spotify",
        title: "Premium Account Required",
        description:
          "Spotify requires a Premium account to play music on the web.",
        defaultSelectedIndex: 1,
        listOptions: [
          {
            type: "action",
            label: "Cancel",
            onSelect: () => {},
          },
          {
            type: "action",
            label: "Continue",
            onSelect: signInWithSpotify,
          },
        ],
      },
    ];
  }, [isAuthorized, isOffline, isMkConfigured, signInWithApple, signInWithSpotify]);
};

export default useSignInOptions;
