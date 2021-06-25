import LoadingIndicator from 'components/LoadingIndicator';
import { useAudioPlayer, useInterval } from 'hooks';
import styled from 'styled-components';
import * as Utils from 'utils';
import { Unit } from 'utils/constants';

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
`;

const TrackProgress = () => {
  const { playbackInfo, updatePlaybackInfo } = useAudioPlayer();

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

  return (
    <Container>
      {isLoading ? (
        <LoadingIndicator size={14} />
      ) : (
        <Label textAlign="left">{Utils.formatTime(currentTime)}</Label>
      )}
      <ProgressBar percent={percent} />
      <Label textAlign="right">-{Utils.formatTime(timeRemaining)}</Label>
    </Container>
  );
};

export default TrackProgress;
