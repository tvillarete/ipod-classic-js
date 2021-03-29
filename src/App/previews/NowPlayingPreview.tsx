import { motion } from 'framer-motion';
import { useMusicKit } from 'hooks/useMusicKit';
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
  const { music } = useMusicKit();
  const { player } = music;

  return music.player.isPlaying ? (
    <Container>
      <Artwork
        src={Utils.getArtwork(300, player?.nowPlayingItem?.artwork?.url)}
        alt="now playing artwork"
      />
    </Container>
  ) : null;
};

export default NowPlayingPreview;
