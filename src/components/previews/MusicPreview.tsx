import { useMemo } from 'react';

import { previewSlideRight } from 'animation';
import { AuthPrompt, KenBurns, LoadingScreen } from 'components';
import { motion } from 'framer-motion';
import { useDataFetcher, useSettings } from 'hooks';
import styled from 'styled-components';

const Container = styled(motion.div)`
  z-index: 1;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const MusicPreview = () => {
  const { isSpotifyAuthorized, isAppleAuthorized } = useSettings();
  const { data: albums, isLoading, hasError } = useDataFetcher<IpodApi.Album[]>(
    {
      name: 'albums',
      artworkSize: 400,
    }
  );

  const artworkUrls = useMemo(() => {
    if (albums && !hasError) {
      return albums.map((album) => album.artwork?.url ?? '');
    }

    return [];
  }, [albums, hasError]);

  return (
    <Container {...previewSlideRight}>
      {isLoading ? (
        <LoadingScreen backgroundColor="linear-gradient(180deg, #B1B5C0 0%, #686E7A 100%)" />
      ) : !isSpotifyAuthorized && !isAppleAuthorized ? (
        <AuthPrompt message="Sign in to view your library" />
      ) : (
        <KenBurns urls={artworkUrls} />
      )}
    </Container>
  );
};

export default MusicPreview;
