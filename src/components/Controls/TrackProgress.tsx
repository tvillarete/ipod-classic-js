import React from 'react';

import { Unit } from 'components';
import LoadingIndicator from 'components/LoadingIndicator';
import { useForceUpdate, useInterval, useMKEventListener } from 'hooks';
import { useMusicKit } from 'hooks/useMusicKit';
import styled from 'styled-components';
import * as Utils from 'utils';

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
  const { music } = useMusicKit();
  const forceUpdate = useForceUpdate();
  const { player } = music;
  const playbackState = music.player?.playbackState;

  const isLoading = playbackState === MusicKit.PlaybackStates.waiting;

  /** Update the progress bar every second. */
  useInterval(() => {
    if (player.isPlaying) {
      forceUpdate();
    }
  }, 1000);

  /** Update the progress bar whenever the playback state changes */
  useMKEventListener('playbackStateDidChange', forceUpdate);

  return (
    <Container>
      {isLoading ? (
        <LoadingIndicator size={14} />
      ) : (
        <Label textAlign="left">
          {Utils.formatTime(player.currentPlaybackTime)}
        </Label>
      )}
      <ProgressBar percent={player.currentPlaybackProgress * 100} />
      <Label textAlign="right">
        -{Utils.formatTime(player.currentPlaybackTimeRemaining)}
      </Label>
    </Container>
  );
};

export default TrackProgress;
