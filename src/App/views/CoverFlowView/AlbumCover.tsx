import React from 'react';

import { fadeScale } from 'animation';
import { AnimatePresence, motion } from 'framer-motion';
import { Album } from 'queries';
import styled, { css } from 'styled-components';
import { getUrlFromPath } from 'utils';

import BacksideContent from './BacksideContent';
import { Point } from './CoverFlow';

const getOffsetPx = (offset: number, midpoint: number) => {
  if (offset === 0) return 0;
  const val = midpoint - 46 + offset * 48;

  return val + (offset < 0 ? -48 : 24);
};

interface ContainerProps {
  isActive: boolean;
  isSelected: boolean;
  isPlaying: boolean;
  isHidden: boolean;
  midpoint: Point;
  offset: number;
  index: number;
  activeIndex: number;
}

const Container = styled.div.attrs((props: ContainerProps) => ({
  style: {
    background: "transparent",
    backgroundSize: "cover"
  }
}))<ContainerProps>`
  z-index: ${props => 1 - Math.abs(props.index - props.activeIndex)};
  position: absolute;
  height: 8em;
  width: 8em;
  transition: transform 0.35s, opacity 0.35s, background 0.35s;
  border: 1px solid rgb(230, 230, 230);
  transform-style: preserve-3d;
  transform: translate3d(0, 0, 0);
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(70%, transparent), to(rgba(250, 250, 250, 0.1)));
  opacity: ${props => props.isHidden && 0};

  ${props =>
    props.isActive &&
    css`
      transform: translateX(${props.midpoint.x - 60}px)
        ${props.isSelected && "rotateY(-180deg) translateY(10%) scale(1)"};

      ${props.isSelected &&
        css`
          border: none;
          -webkit-box-reflect: none;
          ${Artwork} {
            opacity: 0;
          }
        `};

      ${props.isPlaying &&
        css`
          ${Artwork} {
            opacity: 1;
          }
        `};
    `};

  ${props =>
    props.isPlaying &&
    css`
      transform: translate(${props.midpoint.x - 135}px, -10px) rotateY(18deg);
    `};

  ${props =>
    !props.isActive &&
    css`
      transform: translateX(${props.offset}px) translateZ(-65px)
        rotateY(${props.index < props.activeIndex ? "70deg" : "-70deg"});
    `};
`;

const Artwork = styled.img`
  z-index: 0;
  position: absolute;
  height: 8em;
  width: 8em;
  transition: opacity 0.35s;
`;

const Backside = styled(motion.div)`
  position: relative;
  height: 100%;
  width: 100%;
`;

interface Props {
  index: number;
  activeIndex: number;
  midpoint: Point;
  album: Album;
  isSelected: boolean;
  playingAlbum: boolean;
  setPlayingAlbum: (val: boolean) => void;
}

const AlbumCover = ({
  album,
  midpoint,
  index,
  activeIndex,
  isSelected,
  playingAlbum,
  setPlayingAlbum
}: Props) => {
  const isVisible = index > activeIndex - 15 && index < activeIndex + 15;
  const isActive = index === activeIndex;
  const offset = getOffsetPx(index - activeIndex, midpoint.x);
  const isHidden = !isActive && playingAlbum;

  return isVisible ? (
    <Container
      isActive={isActive}
      isSelected={isSelected}
      isHidden={isHidden}
      midpoint={midpoint}
      offset={offset}
      index={index}
      activeIndex={activeIndex}
      isPlaying={isSelected && playingAlbum}
    >
      <Artwork src={getUrlFromPath(album.artwork)} />
      <AnimatePresence>
        {isSelected && !playingAlbum && (
          <Backside {...fadeScale}>
            <BacksideContent album={album} setPlayingAlbum={setPlayingAlbum} />
          </Backside>
        )}
      </AnimatePresence>
    </Container>
  ) : null;
};

export default AlbumCover;
