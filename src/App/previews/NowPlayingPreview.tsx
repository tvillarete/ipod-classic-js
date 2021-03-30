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
  const nowPlayingItem =
    player?.queue?.items?.[player.nowPlayingItemIndex ?? 0];

  return music.player.isPlaying ? (
    <Container>
      <Artwork
        src={Utils.getArtwork(300, nowPlayingItem?.artwork?.url)}
        alt="now playing artwork"
      />
    </Container>
  ) : null;
};

export default NowPlayingPreview;
