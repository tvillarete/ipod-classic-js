import { useCallback } from "react";

import { Controls } from "@/components";
import { useAudioPlayer, useEffectOnce, useMKEventListener } from "@/hooks";
import styled from "styled-components";
import { Unit } from "@/utils/constants";
import * as Utils from "@/utils";

const Container = styled.div`
  height: 100%;
  overflow: hidden;
`;

const StatusBar = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: ${Unit.XS};
  padding: ${Unit.XS} ${Unit.SM} 0;
  height: 1.5em;
`;

const StatusEmoji = styled.span`
  font-size: 14px;
  opacity: 0.8;
`;

const MetadataContainer = styled.div`
  display: flex;
  height: 70%;
  padding: 0 ${Unit.XS};
  perspective: 1000px;
`;

interface ArtworkContainerProps {
  $isHidden?: boolean;
}

const ArtworkContainer = styled.div<ArtworkContainerProps>`
  height: 8em;
  width: 8em;
  margin: auto ${Unit.SM};
  -webkit-box-reflect: below
    0px -webkit-gradient(
      linear,
      left top,
      left bottom,
      from(transparent),
      color-stop(70%, transparent),
      to(rgba(240, 240, 240, 0.2))
    );
  transform-style: preserve-3d;
  transform: rotateY(35deg);
  opacity: ${(props) => (props.$isHidden ? 0 : 1)};
`;

const Artwork = styled.img`
  height: 100%;
  width: 100%;
  border: 1px solid #f3f3f3;
`;

const InfoContainer = styled.div`
  flex: 1;
  margin: auto 0 auto clamp(0.5rem, 5vw, 0.5rem);
  min-width: 0;
`;

const Text = styled.div`
  margin: 0;
  font-size: 0.92rem;
  font-weight: 600;
`;

const Subtext = styled(Text)`
  color: rgb(99, 101, 103);
  font-size: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const {
    nowPlayingItem,
    updateNowPlayingItem,
    updatePlaybackInfo,
    shuffleMode,
    repeatMode,
  } = useAudioPlayer();

  const handlePlaybackChange = useCallback(
    ({ state }: { state: MusicKit.PlaybackStates }) => {
      /** Hide the now playing view if the playback state is "Completed" */
      if (state === MusicKit.PlaybackStates.completed) {
        onHide();
      }
    },
    [onHide]
  );

  useEffectOnce(() => {
    updateNowPlayingItem();
    updatePlaybackInfo();
  });

  useMKEventListener("playbackStateDidChange", handlePlaybackChange);

  const artworkUrl = Utils.getArtwork(300, nowPlayingItem?.artwork?.url);

  return (
    <Container>
      <StatusBar>
        {shuffleMode !== "off" && <StatusEmoji>🔀</StatusEmoji>}
        {repeatMode === "one" && <StatusEmoji>🔂</StatusEmoji>}
        {repeatMode === "all" && <StatusEmoji>🔁</StatusEmoji>}
      </StatusBar>
      <MetadataContainer>
        <ArtworkContainer $isHidden={hideArtwork}>
          <Artwork
            src={artworkUrl}
            alt={
              nowPlayingItem?.name
                ? `${nowPlayingItem.name} album artwork`
                : "Album artwork"
            }
          />
        </ArtworkContainer>
        <InfoContainer>
          <Text>{nowPlayingItem?.name}</Text>
          <Subtext>{nowPlayingItem?.artistName}</Subtext>
          <Subtext>{nowPlayingItem?.albumName}</Subtext>
        </InfoContainer>
      </MetadataContainer>
      <ControlsContainer>
        <Controls />
      </ControlsContainer>
    </Container>
  );
};

export default NowPlaying;
