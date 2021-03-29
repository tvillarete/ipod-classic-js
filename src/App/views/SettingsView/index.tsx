import React, { useCallback, useEffect, useState } from 'react';

import { PREVIEW } from 'App/previews';
import ViewOptions, { AboutView } from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useEffectOnce, useMenuHideWindow, useScrollHandler } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import { useWindowService } from 'services/window';

const SettingsView = () => {
  useMenuHideWindow(ViewOptions.settings.id);
  const { music, isAuthorized } = useMusicKit();
  const { hideWindow } = useWindowService();
  const [authButtonType, setAuthButtonType] = useState<
    'loggedIn' | 'loggedOut'
  >(isAuthorized ? 'loggedIn' : 'loggedOut');
  const [options, setOptions] = useState<SelectableListOption[]>([]);

  const handleAuth = useCallback(async () => {
    console.log('Authing');
    await music.authorize();
    hideWindow();
  }, [hideWindow, music]);

  const handleDeauth = useCallback(async () => {
    console.log('Deauthing');
    await music.unauthorize();
    hideWindow();
  }, [hideWindow, music]);

  const handleUpdateOptions = useCallback(() => {
    const updatedOptions: SelectableListOption[] = [
      {
        type: 'View',
        label: 'About',
        viewId: ViewOptions.about.id,
        component: () => <AboutView />,
        preview: PREVIEW.SETTINGS,
      },
      {
        type: 'Action',
        label: isAuthorized ? 'Sign out' : 'Sign in',
        onSelect: isAuthorized ? handleDeauth : handleAuth,
      },
    ];

    setOptions(updatedOptions);
    setAuthButtonType(isAuthorized ? 'loggedIn' : 'loggedOut');
  }, [handleDeauth, isAuthorized, handleAuth]);

  useEffect(() => {
    if (isAuthorized && authButtonType !== 'loggedIn') {
      console.log('Showing sign out button');
      handleUpdateOptions();
    } else if (!isAuthorized && authButtonType === 'loggedIn') {
      console.log('Showing sign in button');
      handleUpdateOptions();
    }
  }, [authButtonType, handleUpdateOptions, isAuthorized]);

  useEffectOnce(handleUpdateOptions);

  const [scrollIndex] = useScrollHandler(ViewOptions.settings.id, options);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
