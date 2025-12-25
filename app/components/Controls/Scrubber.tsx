import { useCallback, useEffect, useMemo, useState } from "react";

import { useAudioPlayer, useEventListener } from "@/hooks";
import styled from "styled-components";
import { useDebouncedCallback } from "use-debounce";
import { Unit } from "@/utils/constants";

import ProgressBar from "./ProgressBar";
import { IpodEvent } from "@/utils/events";
import * as Utils from "@/utils";

const RootContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  gap: 8px;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below
    0px -webkit-gradient(
      linear,
      left top,
      left bottom,
      from(transparent),
      color-stop(60%, transparent),
      to(rgba(250, 250, 250, 0.1))
    );
`;

interface LabelProps {
  $textAlign: "left" | "right";
}

const Label = styled.h3<LabelProps>`
  font-size: 12px;
  margin: auto 0;
  text-align: ${(props) => props.$textAlign};
  white-space: nowrap;
`;

interface Props {
  isScrubbing: boolean;
}

const Scrubber = ({ isScrubbing }: Props) => {
  const { playbackInfo, seekToTime, nowPlayingItem } = useAudioPlayer();
  const { currentTime, duration } = playbackInfo;
  const [scrubberTime, setScrubberTime] = useState(currentTime);
  const scrubberPercent = useMemo(
    () => (duration > 0 ? Math.round((scrubberTime / duration) * 100) : 0),
    [duration, scrubberTime]
  );
  const scrubberTimeRemaining = useMemo(
    () => duration - scrubberTime,
    [duration, scrubberTime]
  );

  /** The user is actively scrubbing. We disable the 1s update interval in this case. */
  const [isActive, setIsActive] = useState(false);

  /** Wait until the user is finished scrubbing before seeking. */
  const handleSeek = useDebouncedCallback(
    async (newTime: number) => {
      await seekToTime(newTime);
      setIsActive(false);
    },
    300,
    { leading: false, trailing: true }
  );

  const scrubForward = useCallback(() => {
    if (!isScrubbing || scrubberTime >= duration) return;
    const newTime = Math.min(scrubberTime + 1, duration);

    setIsActive(true);
    handleSeek(newTime);
    setScrubberTime(newTime);
  }, [scrubberTime, duration, isScrubbing, handleSeek]);

  const scrubBackward = useCallback(() => {
    if (!isScrubbing || scrubberTime <= 0) return;
    const newTime = Math.max(scrubberTime - 1, 0);

    setIsActive(true);
    handleSeek(newTime);
    setScrubberTime(newTime);
  }, [scrubberTime, handleSeek, isScrubbing]);

  // Sync scrubber time with actual playback time when not actively scrubbing
  useEffect(() => {
    if (!isActive) {
      setScrubberTime(currentTime);
    }
  }, [currentTime, isActive]);

  const hasNowPlayingItem = !!nowPlayingItem;

  const currentTimeLabel = useMemo(
    () =>
      hasNowPlayingItem ? Utils.formatPlaybackTime(scrubberTime) : "--:--",
    [scrubberTime, hasNowPlayingItem]
  );

  const timeRemainingLabel = useMemo(
    () =>
      hasNowPlayingItem
        ? `-${Utils.formatPlaybackTime(scrubberTimeRemaining)}`
        : "--:--",
    [hasNowPlayingItem, scrubberTimeRemaining]
  );

  useEventListener<IpodEvent>("forwardscroll", scrubForward);
  useEventListener<IpodEvent>("backwardscroll", scrubBackward);

  return (
    <RootContainer>
      <Label $textAlign="left">{currentTimeLabel}</Label>
      <ProgressBar percent={scrubberPercent} isScrubber />
      <Label $textAlign="right">{timeRemainingLabel}</Label>
    </RootContainer>
  );
};

export default Scrubber;
