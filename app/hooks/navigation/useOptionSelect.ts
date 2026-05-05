import { useCallback, useEffect, useRef } from "react";

import { SelectableListOption } from "@/components";
import { ViewId } from "@/components/views/registry";
import { PopupId, ActionSheetId } from "@/providers/ViewContextProvider";
import useHapticFeedback from "@/hooks/useHapticFeedback";
import * as Utils from "@/utils";

import { useAudioPlayer, useEventListener, useViewContext } from "@/hooks";
import { IpodEvent } from "@/utils/events";

interface UseOptionSelectOptions {
  id: ViewId | PopupId | ActionSheetId | "keyboard" | string;
  options: SelectableListOption[];
  index: number;
}

/**
 * Handles center-click and long-press dispatch for a selectable list.
 * Reads the option at the current index and performs the appropriate action
 * (navigate to view, play song, open link, fire action, show popup/action sheet).
 */
const useOptionSelect = ({ id, options, index }: UseOptionSelectOptions) => {
  const { triggerHaptics } = useHapticFeedback();
  const { showView, showPopup, showActionSheet, viewStack } = useViewContext();
  const { play, nowPlayingItem } = useAudioPlayer();

  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  });

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const isActive = viewStack[viewStack.length - 1].id === id;

  const handleCenterClick = useCallback(async () => {
    const option = optionsRef.current[indexRef.current];
    if (!isActive || !option) return;
    triggerHaptics();

    switch (option.type) {
      case "song":
        const songId = Utils.getSongIdFromQueueOptions(
          option.queueOptions,
          option.queueOptions.startPosition
        );

        const isSameSong = nowPlayingItem && songId === nowPlayingItem.id;

        if (isSameSong && id !== "coverFlow") {
          showView("nowPlaying");
        } else if (!isSameSong) {
          await play(option.queueOptions);

          if (option.showNowPlayingView) {
            showView("nowPlaying");
          }
        }
        break;
      case "link":
        window.open(option.url, "_blank");
        break;
      case "view":
        showView(option.viewId, option.props, option.headerTitle);
        break;
      case "action":
        option.onSelect();
        break;
      case "popup":
        showPopup({
          id: option.popupId,
          title: option.title,
          description: option.description,
          listOptions: option.listOptions,
        });
        break;
      case "actionSheet":
        showActionSheet({
          id: option.id,
          listOptions: option.listOptions,
        });
        break;
    }
  }, [isActive, triggerHaptics, nowPlayingItem, id, showView, showPopup, showActionSheet, play]);

  const handleCenterLongClick = useCallback(async () => {
    const option = optionsRef.current[indexRef.current];

    if (!isActive || !option) return;

    if (option.longPressOptions) {
      showActionSheet({
        id: "media-action-sheet",
        listOptions: option.longPressOptions,
      });
    }
  }, [isActive, showActionSheet]);

  useEventListener<IpodEvent>("centerclick", handleCenterClick);
  useEventListener<IpodEvent>("centerlongclick", handleCenterLongClick);
};

export default useOptionSelect;
