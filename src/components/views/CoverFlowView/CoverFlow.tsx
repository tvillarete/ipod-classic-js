import { useCallback, useEffect, useRef, useState } from 'react';

import { fade } from 'animation';
import { NowPlaying } from 'components';
import { AnimatePresence, motion } from 'framer-motion';
import { useEventListener, useWindowContext } from 'hooks';
import styled from 'styled-components';

import AlbumCover from './AlbumCover';
import { IpodEvent } from 'utils/events';

export type Point = {
  x: number;
  y: number;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AlbumsContainer = styled.div`
  z-index: 2;
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  flex: 1;
  padding-top: 8%;
  -webkit-overflow-scrolling: touch; /* [3] */
  -ms-overflow-style: -ms-autohiding-scrollbar;
  perspective: 500px;
`;

const InfoContainer = styled(motion.div)`
  z-index: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
`;

const NowPlayingContainer = styled(motion.div)`
  z-index: 1;
  position: absolute;
  top: 20px;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Text = styled.h3`
  margin: 0;
  font-size: 16px;
  text-align: center;

  :first-of-type {
    margin-top: 24px;
  }
`;

interface Props {
  albums: IpodApi.Album[];
}

const CoverFlow = ({ albums }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [midpoint, setMidpoint] = useState<Point>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<IpodApi.Album>();
  const [playingAlbum, setPlayingAlbum] = useState(false);
  const { hideWindow } = useWindowContext();

  const selectAlbum = useCallback(() => {
    if (!selectedAlbum) {
      const album = albums[activeIndex];
      setSelectedAlbum(album);
    }
  }, [activeIndex, albums, selectedAlbum]);

  const handleMenuClick = useCallback(() => {
    if (selectedAlbum && playingAlbum) {
      setPlayingAlbum(false);
    } else if (selectedAlbum) {
      setSelectedAlbum(undefined);
    } else {
      hideWindow();
    }
  }, [hideWindow, playingAlbum, selectedAlbum]);

  const forwardScroll = useCallback(() => {
    if (activeIndex < albums.length - 1 && !selectedAlbum && !playingAlbum) {
      setActiveIndex(activeIndex + 1);
    }
  }, [activeIndex, albums.length, playingAlbum, selectedAlbum]);

  const backwardScroll = useCallback(() => {
    if (activeIndex > 0 && !selectedAlbum && !playingAlbum) {
      setActiveIndex(activeIndex - 1);
    }
  }, [activeIndex, playingAlbum, selectedAlbum]);

  const updateMidpoint = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setMidpoint({ x: width / 2, y: height / 2 });
    }
  }, []);

  useEffect(updateMidpoint, [updateMidpoint]);

  useEventListener<IpodEvent>('centerclick', selectAlbum);
  useEventListener<IpodEvent>('menuclick', handleMenuClick);
  useEventListener<IpodEvent>('forwardscroll', forwardScroll);
  useEventListener<IpodEvent>('backwardscroll', backwardScroll);

  return (
    <Container>
      <AlbumsContainer ref={containerRef}>
        {albums.map((album, index) => (
          <AlbumCover
            key={`cf-artwork-${album.id}`}
            index={index}
            activeIndex={activeIndex}
            midpoint={midpoint}
            album={album}
            playingAlbum={playingAlbum}
            isSelected={!!selectedAlbum && album.id === selectedAlbum.id}
            setPlayingAlbum={setPlayingAlbum}
          />
        ))}
      </AlbumsContainer>

      <AnimatePresence>
        {albums.length && !playingAlbum && (
          <InfoContainer {...fade}>
            <Text>{albums[activeIndex]?.name}</Text>
            {/* TODO: Add artistName */}
            {/* <Text>{albums[activeIndex]?.artistName}</Text> */}
          </InfoContainer>
        )}
        {playingAlbum && (
          <NowPlayingContainer {...fade}>
            <NowPlaying hideArtwork onHide={handleMenuClick} />
          </NowPlayingContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default CoverFlow;
