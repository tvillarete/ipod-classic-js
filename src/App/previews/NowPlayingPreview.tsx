import React from 'react';

import { motion } from 'framer-motion';
import { useAudioService } from 'services/audio';
import styled from 'styled-components';
import { getUrlFromPath } from 'utils';

const Container = styled(motion.div)`
  height: 100%;
`;

const Artwork = styled.img`
  height: 100%;
  width: auto;
`;

const NowPlayingPreview = () => {
  const { source } = useAudioService();

  return source ? (
    <Container>
      <Artwork src={getUrlFromPath(source.artwork)} alt="now playing artwork" />
    </Container>
  ) : null;
};

export default NowPlayingPreview;
