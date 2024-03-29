import { useEffect, useMemo, useRef, useState } from "react";

import { LoadingIndicator, LoadingScreen } from "components";
import ErrorScreen from "components/ErrorScreen";
import { SplitScreenPreview } from "components/previews";
import { AnimatePresence, motion } from "framer-motion";
import { useTimeout } from "hooks";
import styled from "styled-components";

import SelectableListItem from "./SelectableListItem";

export const getConditionalOption = (
  condition?: boolean,
  option?: SelectableListOption
) => (option && condition ? [option] : []);

export type SelectableListOptionType =
  | "view"
  | "link"
  | "song"
  | "action"
  | "actionSheet"
  | "popup";

type SharedOptionProps = {
  type?: SelectableListOptionType;
  label: React.ReactNode;
  isSelected?: boolean;
  sublabel?: string;
  preview?: SplitScreenPreview;
  imageUrl?: string;
  longPressOptions?: SelectableListOption[];
};

type ViewOptionProps = {
  type: "view";
  /** A unique identifier for the next screen. */
  viewId: string;
  /** The component that will be displayed in the next view. */
  component: React.ReactNode | ((...args: any) => JSX.Element);
  headerTitle?: string;
};

type LinkOptionProps = {
  type: "link";
  url: string;
};

type SongOptionProps = {
  type: "song";
  /** Options that will be used to fetch and play a song. */
  queueOptions: MediaApi.QueueOptions;
  /**
   * Show the Now Playing view after starting the song.
   * @default false
   */
  showNowPlayingView?: boolean;
};

type ActionOptionProps = {
  type: "action";
  onSelect: () => void;
};

export type PopupOptionProps = {
  type: "popup";
  /** A unique identifier for the popup. */
  popupId: string;
  listOptions: SelectableListOption[];
  title: string;
  description?: string;
};

export type ActionSheetOptionProps = {
  type: "actionSheet";
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

const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 2rem;
`;

interface Props {
  options: SelectableListOption[];
  activeIndex: number;
  loading?: boolean;
  loadingNextItems?: boolean;
  emptyMessage?: string;
}

const SelectableList = ({
  options,
  activeIndex,
  loading,
  loadingNextItems,
  emptyMessage = "Nothing to see here",
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useTimeout(() => setIsMounted(true), 350);

  const fullOptions = useMemo(
    () => [
      ...options,
      // Show a loading indicator when loading more items.
      ...getConditionalOption(loadingNextItems, {
        type: "action",
        label: (
          <LoadingContainer>
            <LoadingIndicator size={16} />
          </LoadingContainer>
        ),
        onSelect: () => {},
      }),
    ],
    [options, loadingNextItems]
  );

  /** Always make sure the selected item is within the screen's view. */
  useEffect(() => {
    // Delay "isMounted" so that the enter animation doesn't get interrupted.
    // I was stuck on this for like 12 hours and was wondering why
    // the animation wasn't finishing...
    if (isMounted && containerRef.current && fullOptions.length) {
      const { children } = containerRef.current;

      // Make sure the pagination loading indicator is in view.
      if (loadingNextItems) {
        children[activeIndex + 1]?.scrollIntoView({
          block: "nearest",
        });
      } else {
        children[activeIndex]?.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [activeIndex, isMounted, fullOptions.length, loadingNextItems]);

  return (
    <AnimatePresence>
      {loading ? (
        <LoadingScreen backgroundColor="white" />
      ) : options.length > 0 ? (
        <Container ref={containerRef}>
          {fullOptions.map((option, index) => (
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
