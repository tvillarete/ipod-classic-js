import React, { useEffect, useRef, useState } from 'react';

import { PREVIEW } from 'App/previews';
import { WINDOW_TYPE } from 'App/views';
import { LoadingIndicator } from 'components';
import { AnimatePresence } from 'framer-motion';
import { useTimeout } from 'hooks';
import styled from 'styled-components';

import SelectableListItem from './SelectableListItem';

export type SelectableListOptionType = 'View' | 'Link' | 'Song';

type SharedOptionProps = {
  type?: SelectableListOptionType;
  label: string;
  sublabel?: string;
  preview?: PREVIEW;
  imageUrl?: string;
};

type ViewOptionProps = {
  type: 'View';
  /** A unique identifier for the next screen. */
  viewId: string;
  /** The component that will be displayed in the next view. */
  component: React.ReactNode;
  /** Whether to display the default full size view, split view, or in some cases Cover Flow View. */
  windowType?: WINDOW_TYPE;
};

type LinkOptionProps = {
  type: 'Link';
  url: string;
};

type SongOptionProps = {
  type: 'Song';
  /** Options that will be used to fetch and play a song. */
  queueOptions: Omit<MusicKit.SetQueueOptions, 'items'>;
  /**
   * Show the Now Playing view after starting the song.
   * @default false
   */
  showNowPlayingView?: boolean;
};

/** Depending on the option type, certain properties will be available. */
export type SelectableListOption = SharedOptionProps &
  (ViewOptionProps | LinkOptionProps | SongOptionProps);

const Container = styled.div`
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

interface Props {
  options: SelectableListOption[];
  activeIndex: number;
  loading?: boolean;
}

const SelectableList = ({ options, activeIndex, loading }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useTimeout(() => setIsMounted(true), 350);

  /** Always make sure the selected item is within the screen's view. */
  useEffect(() => {
    // Delay "isMounted" so that the enter animation doesn't get interrupted.
    // I was stuck on this for like 12 hours and was wondering why
    // the animation wasn't finishing...
    if (isMounted && containerRef.current && options.length) {
      const { children } = containerRef.current;
      children[activeIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeIndex, isMounted, options.length]);

  return (
    <AnimatePresence>
      {loading ? (
        <LoadingIndicator backgroundColor="white" />
      ) : (
        <Container ref={containerRef}>
          {options.map((option, index) => (
            <SelectableListItem
              key={`option-${option.label}-${index}`}
              option={option}
              isActive={index === activeIndex}
            />
          ))}
        </Container>
      )}
    </AnimatePresence>
  );
};

export default SelectableList;
