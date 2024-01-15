import { useCallback, useState } from "react";

import { viewConfigMap } from "components";
import { useViewContext } from "hooks";
import { useEventListener } from "hooks/utils";

interface KeyboardInputHook {
  value: string;
  showKeyboard: () => void;
}

interface Props {
  initialValue?: string;
  /** By default, we only allow dispatching of keypresses by the keyboard.
   * This can be overridden by setting `readOnly` to false. */
  readOnly?: boolean;
  onEnterPress?: () => void;
  onChange?: (value: string) => void;
}

const useKeyboardInput = ({
  initialValue = "",
  readOnly = true,
  onEnterPress = () => {},
  onChange = () => {},
}: Props = {}): KeyboardInputHook => {
  const { showView, hideView } = useViewContext();
  const [value, setValue] = useState(initialValue);

  useEventListener("input", ({ detail }) => {
    // TODO: Only trigger keyboard input for one screen at a time.
    const { key } = detail;

    if (key === "Enter") {
      onEnterPress();
      hideView(viewConfigMap.keyboard.id);
      return;
    }

    setValue((prevValue) => {
      let newValue = prevValue;

      if (key === "Backspace" || key === "delete") {
        newValue = prevValue.slice(0, -1);
      } else if (key === " ") {
        newValue = `${prevValue} `;
      } else {
        newValue = `${prevValue}${key}`;
      }

      onChange(newValue);
      return newValue;
    });
  });

  const handleKeypress = useCallback(
    ({ key }: KeyboardEvent) => {
      if (readOnly) {
        return;
      }

      const inputEvent = new CustomEvent("input", {
        detail: {
          key,
        },
      });

      window.dispatchEvent(inputEvent);
    },
    [readOnly]
  );

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        handleKeypress(event);
      }
    },
    [handleKeypress]
  );

  useEventListener("keypress", handleKeypress);
  useEventListener("keydown", handleKeydown);

  const showKeyboard = useCallback(() => {
    showView({
      id: viewConfigMap.keyboard.id,
      type: "keyboard",
    });
  }, [showView]);

  return {
    value,
    showKeyboard,
  };
};

export default useKeyboardInput;
