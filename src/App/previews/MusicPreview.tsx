import { useCallback, useEffect, useState } from 'react';

import { previewSlideRight } from 'animation';
import { AuthPrompt, KenBurns, LoadingScreen } from 'components';
import { motion } from 'framer-motion';
import { useMusicKit } from 'hooks/useMusicKit';
import styled from 'styled-components';
import * as Utils from 'utils';

const Container = styled(motion.div)`
  z-index: 1;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const MusicPreview = () => {
  const { music, isConfigured, isAuthorized } = useMusicKit();
  const [artworkUrls, setArtworkUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMount = useCallback(async () => {
    setLoading(true);
    const albums = await music.api.library.albums(null);
    const urls = albums.map(
      (album) => Utils.getArtwork(300, album.attributes?.artwork?.url) ?? ''
    );

    setArtworkUrls(urls);

    setLoading(false);
  }, [music]);

  useEffect(() => {
    if (isConfigured && isAuthorized) {
      handleMount();
    }
  }, [handleMount, isAuthorized, isConfigured]);

  return (
    <Container {...previewSlideRight}>
      {loading ? (
        <LoadingScreen backgroundColor="linear-gradient(180deg, #B1B5C0 0%, #686E7A 100%)" />
      ) : !isAuthorized ? (
        <AuthPrompt message="Sign in to view your library" />
      ) : (
        <KenBurns urls={artworkUrls} />
      )}
    </Container>
  );
};

export default MusicPreview;
