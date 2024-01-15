import LoadingIndicator from "components/LoadingIndicator";
import { useAudioPlayer, useInterval } from "hooks";
import styled from "styled-components";
import * as Utils from "utils";
import { Unit } from "utils/constants";

import ProgressBar from "./ProgressBar";
import { useMemo } from "react";

const Container = styled.div`
  position: relative;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
  display: grid;
  grid-template-columns: 40px 1fr 40px;
`;

interface LabelProps {
  $textAlign: "left" | "right";
}

const Label = styled.h3<LabelProps>`
  font-size: 12px;
  margin: auto 0;
  text-align: ${(props) => props.$textAlign};
`;

const TrackProgress = () => {
  const { playbackInfo, updatePlaybackInfo, nowPlayingItem } = useAudioPlayer();

  const {
    isLoading,
    isPlaying,
    isPaused,
    currentTime,
    percent,
    timeRemaining,
  } = playbackInfo;

  /** Update the progress bar every second. */
  useInterval(() => {
    if (isPlaying && !isPaused) {
      updatePlaybackInfo();
    }
  }, 1000);

  const hasNowPlayingItem = !!nowPlayingItem;

  const currentTimeLabel = useMemo(
    () => (hasNowPlayingItem ? Utils.formatPlaybackTime(currentTime) : "--:--"),
    [currentTime, hasNowPlayingItem]
  );

  const timeRemainingLabel = useMemo(
    () =>
      hasNowPlayingItem
        ? `-${Utils.formatPlaybackTime(timeRemaining)}`
        : "--:--",
    [hasNowPlayingItem, timeRemaining]
  );

  return (
    <Container>
      {isLoading ? (
        <LoadingIndicator size={14} />
      ) : (
        <Label $textAlign="left">{currentTimeLabel}</Label>
      )}
      <ProgressBar percent={percent} />
      <Label $textAlign="right">{timeRemainingLabel}</Label>
    </Container>
  );
};

export default TrackProgress;
