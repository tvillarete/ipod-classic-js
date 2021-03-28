import React, { useCallback, useState } from 'react';

import { Unit } from 'components';
import { useEffectOnce, useEventListener, useInterval } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import styled from 'styled-components';
import { formatTime } from 'utils';

import ProgressBar from './ProgressBar';

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
  const { music } = useMusicKit();
  const { player } = music;
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime] = useState(0);

  const scrubForward = useCallback(() => {
    if (currentTime === player.currentPlaybackDuration || !isScrubbing) return;
    const newTime = currentTime + 1;

    if (newTime < maxTime) {
      player.seekToTime(newTime);
      setCurrentTime(newTime);
    }
  }, [currentTime, isScrubbing, maxTime, player]);

  const scrubBackward = useCallback(() => {
    if (currentTime === 0 || !isScrubbing) return;
    const newTime = currentTime - 1;

    if (newTime >= 0) {
      player.seekToTime(newTime);
      setCurrentTime(newTime);
    }
  }, [currentTime, isScrubbing, player]);

  const refresh = useCallback(
    (force = false) => {
      if (player.isPlaying || force) {
        setCurrentTime(player.currentPlaybackTime);
      }
    },
    [player.currentPlaybackTime, player.isPlaying]
  );

  useEventListener('forwardscroll', scrubForward);
  useEventListener('backwardscroll', scrubBackward);

  /** Update the progress bar every second. */
  useInterval(refresh, 1000);

  useEffectOnce(() => refresh(true));

  return (
    <Container>
      <Label textAlign="left">{formatTime(currentTime)}</Label>
      <ProgressBar percent={player.currentPlaybackProgress * 100} isScrubber />
      <Label textAlign="right">
        -{formatTime(player.currentPlaybackTimeRemaining)}
      </Label>
    </Container>
  );
};

export default Scrubber;
