import { useMemo } from 'react';

import { previewSlideRight } from 'animation';
import { AuthPrompt, KenBurns, LoadingScreen } from 'components';
import { motion } from 'framer-motion';
import { useFetchAlbums, useSettings } from 'hooks';
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

  const {
    data: albums,
    isLoading,
    error,
  } = useFetchAlbums({
    artworkSize: 400,
  });

  const artworkUrls = useMemo(() => {
    if (albums && !error) {
      return albums.pages.flatMap(
        (page) => page?.data.map((album) => album.artwork?.url ?? '') ?? []
      );
    }

    return [];
  }, [albums, error]);

  return (
    <Container {...previewSlideRight}>
      {!isSpotifyAuthorized && !isAppleAuthorized ? (
        <AuthPrompt message="Sign in to view your library" />
      ) : isLoading && !albums ? (
        <LoadingScreen backgroundColor="linear-gradient(180deg, #B1B5C0 0%, #686E7A 100%)" />
      ) : (
        <KenBurns urls={artworkUrls} />
      )}
    </Container>
  );
};

export default MusicPreview;
