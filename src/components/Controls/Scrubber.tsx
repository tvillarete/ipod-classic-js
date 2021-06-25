import { useCallback, useMemo, useState } from 'react';

import { useAudioPlayer, useEventListener, useInterval } from 'hooks';
import styled from 'styled-components';
import { useDebouncedCallback } from 'use-debounce/lib';
import { formatTime } from 'utils';
import { Unit } from 'utils/constants';

import ProgressBar from './ProgressBar';
import { IpodEvent } from 'utils/events';

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 1em;
  padding: 0 ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
`;

interface LabelProps {
  textAlign: 'left' | 'right';
}

const Label = styled.h3<LabelProps>`
  font-size: 12px;
  margin: auto 0;
  width: 30px;
  text-align: ${(props) => props.textAlign};
  white-space: nowrap;
`;

interface Props {
  isScrubbing: boolean;
}

const Scrubber = ({ isScrubbing }: Props) => {
  const { playbackInfo, seekToTime } = useAudioPlayer();
  const { currentTime, duration, isPlaying } = playbackInfo;
  const [scrubberTime, setScrubberTime] = useState(currentTime);
  const scrubberPercent = useMemo(
    () => Math.round((scrubberTime / duration) * 100),
    [duration, scrubberTime]
  );
  const scrubberTimeRemaining = useMemo(
    () => duration - scrubberTime,
    [duration, scrubberTime]
  );

  /** The user is actively scrubbing. We disable the 1s update interval in this case. */
  const [isActive, setIsActive] = useState(false);

  /** Wait until the user is finished scrubbing before seeking. */
  const handleSeek = useDebouncedCallback((newTime: number) => {
    seekToTime(newTime);
    setIsActive(false);
  }, 300);

  const scrubForward = useCallback(() => {
    if (scrubberTime === duration || !isScrubbing) return;
    const newTime = scrubberTime + 1;

    if (newTime < duration) {
      setIsActive(true);
      handleSeek(newTime);
      setScrubberTime(newTime);
    }
  }, [scrubberTime, duration, isScrubbing, handleSeek]);

  const scrubBackward = useCallback(() => {
    if (scrubberTime === 0 || !isScrubbing) return;
    const newTime = scrubberTime - 1;

    if (newTime >= 0) {
      setIsActive(true);
      handleSeek(newTime);
      setScrubberTime(newTime);
    }
  }, [scrubberTime, handleSeek, isScrubbing]);

  const refresh = useCallback(
    (force = false) => {
      if ((!isActive && isPlaying) || force) {
        setScrubberTime(currentTime);
      }
    },
    [currentTime, isActive, isPlaying]
  );

  useEventListener<IpodEvent>('forwardscroll', scrubForward);
  useEventListener<IpodEvent>('backwardscroll', scrubBackward);

  /** Update the progress bar every second. */
  useInterval(refresh, 1000);

  return (
    <Container>
      <Label textAlign="left">{formatTime(scrubberTime)}</Label>
      <ProgressBar percent={scrubberPercent} isScrubber />
      <Label textAlign="right">-{formatTime(scrubberTimeRemaining)}</Label>
    </Container>
  );
};

export default Scrubber;
