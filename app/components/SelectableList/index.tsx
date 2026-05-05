import { useMemo } from "react";

import { LoadingIndicator, LoadingScreen } from "@/components";
import ErrorScreen from "@/components/ErrorScreen";
import { SplitScreenPreview } from "@/components/previews";
import { ViewId, ViewProps } from "@/components/views/registry";
import { PopupId, ActionSheetId } from "@/providers/ViewContextProvider";
import { AnimatePresence, motion } from "motion/react";
import { useScrollIntoView } from "@/hooks";
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

type ViewOptionProps<TViewId extends ViewId = ViewId> = {
  type: "view";
  /** A unique identifier for the next screen. */
  viewId: TViewId;
  /** Props to pass to the view component (type-safe via registry). */
  props?: ViewProps[TViewId];
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
  popupId: PopupId;
  listOptions: SelectableListOption[];
  title: string;
  description?: string;
};

export type ActionSheetOptionProps = {
  type: "actionSheet";
  /** A unique identifier for the action sheet. */
  id: ActionSheetId;
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
  /** Custom renderer for each option. If omitted, uses the default SelectableListItem. */
  renderItem?: (option: SelectableListOption, index: number, isActive: boolean) => React.ReactNode;
}

const SelectableList = ({
  options,
  activeIndex,
  loading,
  loadingNextItems,
  emptyMessage = "Nothing to see here",
  renderItem,
}: Props) => {
  const fullOptions = useMemo(
    () => [
      ...options,
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

  const containerRef = useScrollIntoView({
    activeIndex,
    itemCount: fullOptions.length,
    mountDelay: 350,
    scrollNextItem: !!loadingNextItems,
  });

  return (
    <AnimatePresence>
      {loading ? (
        <LoadingScreen backgroundColor="white" />
      ) : options.length > 0 ? (
        <Container ref={containerRef}>
          {fullOptions.map((option, index) => {
            const isActive = index === activeIndex;
            return renderItem
              ? renderItem(option, index, isActive)
              : (
                <SelectableListItem
                  key={`option-${option.label}-${index}`}
                  option={option}
                  isActive={isActive}
                />
              );
          })}
        </Container>
      ) : (
        <ErrorScreen showImage={false} message={emptyMessage} />
      )}
    </AnimatePresence>
  );
};

export default SelectableList;
