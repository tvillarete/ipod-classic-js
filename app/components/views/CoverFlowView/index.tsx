import React, { useCallback } from "react";

import { AuthPrompt, LoadingScreen } from "components";
import { useEventListener, useSettings, useViewContext } from "hooks";
import styled from "styled-components";

import CoverFlow from "./CoverFlow";
import { IpodEvent } from "utils/events";
import { useFetchAlbums } from "hooks/utils/useDataFetcher";

const Container = styled.div`
  height: 100%;
  flex: 1;
`;

const CoverFlowView = () => {
  const { hideView } = useViewContext();
  const { isAuthorized } = useSettings();
  const { data, isLoading } = useFetchAlbums({
    artworkSize: 350,
  });

  const albums = data?.pages.flatMap((page) => page?.data ?? []) ?? [];

  const handleMenuClick = useCallback(() => {
    if (!isAuthorized || isLoading) {
      hideView();
    }
  }, [hideView, isAuthorized, isLoading]);

  useEventListener<IpodEvent>("menuclick", handleMenuClick);

  return (
    <Container>
      {!isAuthorized ? (
        <AuthPrompt message="Sign in to view Cover Flow" />
      ) : isLoading ? (
        <LoadingScreen backgroundColor="white" />
      ) : (
        <CoverFlow albums={albums} />
      )}
    </Container>
  );
};

export default CoverFlowView;
