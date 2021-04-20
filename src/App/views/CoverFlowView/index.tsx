import React, { useCallback } from 'react';

import { AuthPrompt, LoadingScreen } from 'components';
import { useDataFetcher, useEventListener, useSettings } from 'hooks';
import { useWindowService } from 'services/window';
import styled from 'styled-components';

import CoverFlow from './CoverFlow';

const Container = styled.div`
  flex: 1;
`;

const CoverFlowView = () => {
  const { hideWindow } = useWindowService();
  const { isAuthorized } = useSettings();
  const { data: albums, isLoading } = useDataFetcher<IpodApi.Album[]>({
    name: 'albums',
  });

  const handleMenuClick = useCallback(() => {
    if (!isAuthorized || isLoading) {
      hideWindow();
    }
  }, [hideWindow, isAuthorized, isLoading]);

  useEventListener('menuclick', handleMenuClick);

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
