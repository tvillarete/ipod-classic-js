import React, { useState } from 'react';

import { motion } from 'framer-motion';
import styled from 'styled-components';

// import { getArtwork, getUrlFromPath } from 'utils';

const Container = styled(motion.div)`
  height: 100%;
`;

// const Artwork = styled.img`
//   height: 100%;
//   width: auto;
// `;

const NowPlayingPreview = () => {
  const [isPlaying] = useState(false);

  return isPlaying ? (
    <Container>
      {/* <Artwork src={getArtwork()} alt="now playing artwork" /> */}
    </Container>
  ) : null;
};

export default NowPlayingPreview;
