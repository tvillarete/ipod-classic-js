import { useMemo } from 'react';

import {
  getConditionalOption,
  SelectableList,
  SelectableListOption,
} from 'components';
import { PREVIEW } from 'components/previews';
import ViewOptions, { AboutView } from 'components/views';
import {
  useMenuHideWindow,
  useMusicKit,
  useScrollHandler,
  useSettings,
  useSpotifySDK,
} from 'hooks';

const SettingsView = () => {
  useMenuHideWindow(ViewOptions.settings.id);
  const { isAuthorized, isAppleAuthorized, isSpotifyAuthorized, service } =
    useSettings();
  const { signIn: signInWithApple, signOut: signOutApple } = useMusicKit();
  const { signOut: signOutSpotify, signIn: signInWithSpotify } =
    useSpotifySDK();

  const options: SelectableListOption[] = useMemo(
    () => [
      {
        type: 'View',
        label: 'About',
        viewId: ViewOptions.about.id,
        component: () => <AboutView />,
        preview: PREVIEW.SETTINGS,
      },
      /** Add an option to select between services signed into more than one. */
      ...getConditionalOption(isAuthorized, {
        type: 'ActionSheet',
        id: ViewOptions.serviceTypeActionSheet.id,
        label: 'Choose service',
        listOptions: [
          {
            type: 'Action',
            label: `Apple Music ${service === 'apple' ? '(Current)' : ''}`,
            onSelect: () => {
              signInWithApple();
            },
          },
          {
            type: 'Action',
            label: `Spotify ${service === 'spotify' ? '(Current)' : ''}`,
            onSelect: signInWithSpotify,
          },
        ],
        preview: PREVIEW.SERVICE,
      }),
      /** Show the sign in option if not signed into any service. */
      ...getConditionalOption(!isAuthorized, {
        type: 'ActionSheet',
        id: ViewOptions.signinPopup.id,
        label: 'Sign in',
        listOptions: [
          {
            type: 'Action',
            label: 'Apple Music',
            onSelect: () => {
              signInWithApple();
            },
          },
          {
            type: 'Action',
            label: 'Spotify',
            onSelect: signInWithSpotify,
          },
        ],
        preview: PREVIEW.MUSIC,
      }),
      /** Show the signout option for any services that are authenticated. */
      ...getConditionalOption(isAuthorized, {
        type: 'ActionSheet',
        id: ViewOptions.signOutPopup.id,
        label: 'Sign out',
        listOptions: [
          ...getConditionalOption(isAppleAuthorized, {
            type: 'Action',
            label: 'Apple Music',
            onSelect: signOutApple,
          }),
          ...getConditionalOption(isSpotifyAuthorized, {
            type: 'Action',
            label: 'Spotify',
            onSelect: signOutSpotify,
          }),
        ],
        preview: PREVIEW.SERVICE,
      }),
    ],
    [
      isAppleAuthorized,
      isAuthorized,
      isSpotifyAuthorized,
      service,
      signInWithApple,
      signInWithSpotify,
      signOutApple,
      signOutSpotify,
    ]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.settings.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
