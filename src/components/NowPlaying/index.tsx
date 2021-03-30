import { useCallback } from 'react';

import { Controls, Unit } from 'components';
import { useForceUpdate, useMKEventListener, useMusicKit } from 'hooks';
import styled from 'styled-components';
import { getArtwork } from 'utils';

const Container = styled.div`
  height: 100%;
  overflow: hidden;
`;

const MetadataContainer = styled.div`
  display: flex;
  height: 70%;
  padding: 0 ${Unit.XS};
`;

interface ArtworkContainerProps {
  isHidden?: boolean;
}

const ArtworkContainer = styled.div<ArtworkContainerProps>`
  height: 8em;
  width: 8em;
  margin: auto ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(70%, transparent), to(rgba(250, 250, 250, 0.1)));
  transform-style: preserve-3d;
  perspective: 500px;
  opacity: ${(props) => props.isHidden && 0};
`;

const Artwork = styled.img`
  height: 100%;
  width: 100%;
  transform: rotateY(18deg);
  border: 1px solid #f3f3f3;
`;

const InfoContainer = styled.div`
  flex: 1;
  margin: auto 0 auto ${Unit.XS};
`;

const Text = styled.h3`
  margin: 0;
  font-size: 0.92rem;
`;

const Subtext = styled(Text)`
  color: rgb(99, 101, 103);
  font-size: 0.75rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 30%;
`;

interface Props {
  hideArtwork?: boolean;
  onHide: () => void;
}

const NowPlaying = ({ hideArtwork, onHide }: Props) => {
  const { music } = useMusicKit();
  const { player } = music;
  const queue = player?.queue;
  const nowPlayingItem = queue?.items?.[player.nowPlayingItemIndex ?? 0];
  const forceUpdate = useForceUpdate();

  const handlePlaybackChange = useCallback(
    ({ state }: { state: MusicKit.PlaybackStates }) => {
      /** Hide the now playing view if the playback state is "Completed" */
      if (state === MusicKit.PlaybackStates.completed) {
        onHide();
      }

      forceUpdate();
    },
    [onHide, forceUpdate]
  );

  useMKEventListener('playbackStateDidChange', handlePlaybackChange);

  /** Force a component re-render whenever the queue position changes. */
  useMKEventListener('queuePositionDidChange', forceUpdate);

  return (
    <Container>
      <MetadataContainer>
        <ArtworkContainer isHidden={hideArtwork}>
          <Artwork src={getArtwork(300, nowPlayingItem?.artwork?.url)} />
        </ArtworkContainer>
        <InfoContainer>
          <Text>{nowPlayingItem?.title}</Text>
          <Subtext>{nowPlayingItem?.artistName}</Subtext>
          <Subtext>{nowPlayingItem?.albumName}</Subtext>
          {!!nowPlayingItem && (
            <Subtext>{`${music.player.queue.position + 1} of ${
              music.player.queue.length
            }`}</Subtext>
          )}
        </InfoContainer>
      </MetadataContainer>
      <ControlsContainer>
        <Controls />
      </ControlsContainer>
    </Container>
  );
};

export default NowPlaying;
