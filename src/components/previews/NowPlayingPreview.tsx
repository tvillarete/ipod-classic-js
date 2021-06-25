import { motion } from 'framer-motion';
import { useAudioPlayer } from 'hooks';
import styled from 'styled-components';
import * as Utils from 'utils';

const Container = styled(motion.div)`
  height: 100%;
`;

const Artwork = styled.img`
  height: 100%;
  width: auto;
`;

const NowPlayingPreview = () => {
  const { nowPlayingItem } = useAudioPlayer();

  return nowPlayingItem ? (
    <Container>
      <Artwork
        src={Utils.getArtwork(300, nowPlayingItem.artwork?.url)}
        alt="now playing artwork"
      />
    </Container>
  ) : null;
};

export default NowPlayingPreview;
