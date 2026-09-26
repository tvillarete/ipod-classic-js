import React, { useCallback } from "react";

import AuthPrompt from "@/components/AuthPrompt";
import LoadingScreen from "@/components/LoadingScreen";
import { SplitScreenPreview } from "@/components/previews";
import { defineView } from "@/components/views/defineView";
import { useEventListener, useSettings, useViewContext } from "@/hooks";
import styled from "styled-components";

import CoverFlow from "./CoverFlow";
import { IpodEvent } from "@/utils/events";
import { useFetchAlbums } from "@/hooks/utils/useDataFetcher";

const Container = styled.div`
  height: 100%;
  flex: 1;
`;

const _CoverFlowView = () => {
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

export const CoverFlowView = Object.assign(_CoverFlowView, {
  viewConfig: defineView({
    component: _CoverFlowView,
    type: "coverFlow",
    title: "Cover Flow",
    preview: SplitScreenPreview.Music,
  }),
});
