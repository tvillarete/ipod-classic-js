import { useEffect, useRef, useState } from 'react';

import { LoadingScreen } from 'components';
import ErrorScreen from 'components/ErrorScreen';
import { PREVIEW } from 'components/previews';
import { WINDOW_TYPE } from 'components/views';
import { AnimatePresence } from 'framer-motion';
import { useTimeout } from 'hooks';
import styled from 'styled-components';

import SelectableListItem from './SelectableListItem';

export const getConditionalOption = (
  condition?: boolean,
  option?: SelectableListOption
) => (option && condition ? [option] : []);

export type SelectableListOptionType =
  | 'View'
  | 'Link'
  | 'Song'
  | 'Action'
  | 'ActionSheet'
  | 'Popup';

type SharedOptionProps = {
  type?: SelectableListOptionType;
  label: string;
  sublabel?: string;
  preview?: PREVIEW;
  imageUrl?: string;
  longPressOptions?: SelectableListOption[];
};

type ViewOptionProps = {
  type: 'View';
  /** A unique identifier for the next screen. */
  viewId: string;
  /** The component that will be displayed in the next view. */
  component: React.ReactNode;
  /** Whether to display the default full size view, split view, or in some cases Cover Flow View. */
  windowType?: WINDOW_TYPE.SPLIT | WINDOW_TYPE.FULL | WINDOW_TYPE.COVER_FLOW;
};

type LinkOptionProps = {
  type: 'Link';
  url: string;
};

type SongOptionProps = {
  type: 'Song';
  /** Options that will be used to fetch and play a song. */
  queueOptions: IpodApi.QueueOptions;
  /**
   * Show the Now Playing view after starting the song.
   * @default false
   */
  showNowPlayingView?: boolean;
};

type ActionOptionProps = {
  type: 'Action';
  onSelect: () => void;
};

export type PopupOptionProps = {
  type: 'Popup';
  /** A unique identifier for the popup. */
  popupId: string;
  listOptions: SelectableListOption[];
  title: string;
  description?: string;
};

export type ActionSheetOptionProps = {
  type: 'ActionSheet';
  /** A unique identifier for the action sheet. */
  id: string;
  listOptions: SelectableListOption[];
};

/** Depending on the option type, certain properties will be available. */
export type SelectableListOption = SharedOptionProps &
  (
    | ViewOptionProps
    | LinkOptionProps
    | SongOptionProps
    | ActionOptionProps
    | ActionSheetOptionProps
    | PopupOptionProps
  );

const Container = styled.div`
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

interface Props {
  options: SelectableListOption[];
  activeIndex: number;
  loading?: boolean;
  emptyMessage?: string;
}

const SelectableList = ({
  options,
  activeIndex,
  loading,
  emptyMessage = 'Nothing to see here',
}: Props) => {
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
      children[activeIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeIndex, isMounted, options.length]);

  return (
    <AnimatePresence>
      {loading ? (
        <LoadingScreen backgroundColor="white" />
      ) : options.length > 0 ? (
        <Container ref={containerRef}>
          {options.map((option, index) => (
            <SelectableListItem
              key={`option-${option.label}-${index}`}
              option={option}
              isActive={index === activeIndex}
            />
          ))}
        </Container>
      ) : (
        <ErrorScreen showImage={false} message={emptyMessage} />
      )}
    </AnimatePresence>
  );
};

export default SelectableList;
