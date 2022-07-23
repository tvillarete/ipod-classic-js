import React, { useCallback } from 'react';

import { AuthPrompt, LoadingScreen } from 'components';
import {
  useFetchAlbums,
  useEventListener,
  useSettings,
  useWindowContext,
} from 'hooks';
import styled from 'styled-components';

import CoverFlow from './CoverFlow';
import { IpodEvent } from 'utils/events';

const Container = styled.div`
  flex: 1;
`;

const CoverFlowView = () => {
  const { hideWindow } = useWindowContext();
  const { isAuthorized } = useSettings();
  const { data: albums, isLoading } = useFetchAlbums({
    artworkSize: 350,
  });

  const handleMenuClick = useCallback(() => {
    if (!isAuthorized || isLoading) {
      hideWindow();
    }
  }, [hideWindow, isAuthorized, isLoading]);

  useEventListener<IpodEvent>('menuclick', handleMenuClick);

  return (
    <Container>
      {isLoading ? (
        <LoadingScreen backgroundColor="white" />
      ) : !isAuthorized ? (
        <AuthPrompt message="Sign in to view Cover Flow" />
      ) : (
        <CoverFlow albums={albums ?? []} />
      )}
    </Container>
  );
};

export default CoverFlowView;
