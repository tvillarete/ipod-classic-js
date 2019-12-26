import React, { useEffect } from "react";
import { useAudioService } from "services/audio";
import styled from "styled-components";
import { getUrlFromPath } from "utils";
import { Unit, Controls } from "components";

const Container = styled.div`
  height: 100%;
`;

const MetadataContainer = styled.div`
  display: flex;
  height: 70%;
  padding: 0 ${Unit.XS};
`;

const ArtworkContainer = styled.div`
  height: 8em;
  width: 9em;
  margin: auto ${Unit.SM};
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(70%, transparent), to(rgba(250, 250, 250, 0.1)));
  transform-style: preserve-3d;
  perspective: 500px;
`;

const Artwork = styled.img`
  height: 100%;
  width: 100%;
  transform: rotateY(18deg);
  border: 1px solid #f3f3f3;
`;

const InfoContainer = styled.div`
  flex: 1;
  margin: auto 0;
`;

const Text = styled.h3`
  margin: 0;
  font-size: 0.92rem;
`;

const Subtext = styled(Text)`
  color: rgb(99, 101, 103);
  font-size: 0.85rem;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 30%;
`;

const NowPlayingView = () => {
  const { source, songIndex } = useAudioService();
  // const [index] = useScrollHandler(ViewIds.nowPlaying, options);
  useEffect(() => {}, []);

  return source ? (
    <Container>
      <MetadataContainer>
        <ArtworkContainer>
          <Artwork src={getUrlFromPath(source.artwork)}></Artwork>
        </ArtworkContainer>
        <InfoContainer>
          <Text>{source.name}</Text>
          <Subtext>{source.artist}</Subtext>
          <Subtext>{source.album}</Subtext>
          <Subtext>{`${songIndex + 1} of 10`}</Subtext>
        </InfoContainer>
      </MetadataContainer>
      <ControlsContainer>
        <Controls />
      </ControlsContainer>
    </Container>
  ) : null;
};

export default NowPlayingView;
