import React, { useCallback, useState } from 'react';

import { Unit } from 'components';
import { useInterval } from 'hooks';
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

// const LoadingContainer = styled.div`
//   position: relative;
//   width: 24px;
// `;

interface LabelProps {
  textAlign: 'left' | 'right';
}

const Label = styled.h3<LabelProps>`
  font-size: 12px;
  margin: auto 0;
  width: 30px;
  text-align: ${(props) => props.textAlign};
`;

const TrackProgress = () => {
  const { music } = useMusicKit();
  const { player } = music;
  const [currentTime, setCurrentTime] = useState(0);

  const refresh = useCallback(() => {
    if (player.isPlaying) {
      setCurrentTime(player.currentPlaybackTime);
    }
  }, [player.currentPlaybackTime, player.isPlaying]);

  /** Update the progress bar every second. */
  useInterval(refresh, 1000);

  return (
    <Container>
      <Label textAlign="left">{formatTime(currentTime)}</Label>
      <ProgressBar percent={player.currentPlaybackProgress * 100} />
      <Label textAlign="right">
        -{formatTime(player.currentPlaybackTimeRemaining)}
      </Label>
    </Container>
  );
};

export default TrackProgress;
