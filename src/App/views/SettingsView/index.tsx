import { useMemo } from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, { AboutView } from 'App/views';
import {
  getConditionalOption,
  SelectableList,
  SelectableListOption,
} from 'components';
import { useMenuHideWindow, useScrollHandler, useSpotifySDK } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import { useSettings } from 'hooks/useSettings';

const SettingsView = () => {
  useMenuHideWindow(ViewOptions.settings.id);
  const {
    isAuthorized,
    isAppleAuthorized,
    isSpotifyAuthorized,
    service,
    setService,
  } = useSettings();
  const { music, signIn: signInWithApple } = useMusicKit();
  const {
    signOut: signOutSpotify,
    signIn: signInWithSpotify,
  } = useSpotifySDK();

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
        label: 'Change Service',
        listOptions: [
          ...getConditionalOption(service === 'spotify', {
            type: 'Action',
            label: 'Apple Music',
            onSelect: () => {
              signInWithApple();
            },
          }),
          ...getConditionalOption(service === 'apple', {
            type: 'Action',
            label: 'Spotify',
            onSelect: () => setService('spotify'),
          }),
        ],
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
            onSelect: () => music.authorize(),
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
            onSelect: () => music.unauthorize(),
          }),
          ...getConditionalOption(isSpotifyAuthorized, {
            type: 'Action',
            label: 'Spotify',
            onSelect: signOutSpotify,
          }),
        ],
        preview: PREVIEW.MUSIC,
      }),
    ],
    [
      isAppleAuthorized,
      isAuthorized,
      isSpotifyAuthorized,
      music,
      service,
      setService,
      signInWithApple,
      signInWithSpotify,
      signOutSpotify,
    ]
  );

  const [scrollIndex] = useScrollHandler(ViewOptions.settings.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
