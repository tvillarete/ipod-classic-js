import { useCallback, useState } from 'react';

import { ViewOptions, WINDOW_TYPE } from 'components';
import { useWindowContext } from 'hooks';
import { useEventListener } from 'hooks/utils';

interface KeyboardInputHook {
  value: string;
  showKeyboard: () => void;
}

interface Props {
  initialValue?: string;
  /** By default, we only allow dispatching of keypresses by the keyboard.
   * This can be overridden by setting `readOnly` to false. */
  readOnly?: boolean;
}

const useKeyboardInput = ({
  initialValue = '',
  readOnly = true,
}: Props = {}): KeyboardInputHook => {
  const { showWindow, hideWindow } = useWindowContext();
  const [value, setValue] = useState(initialValue);

  useEventListener('input', ({ detail }) => {
    // TODO: Only trigger keyboard input for one screen at a time.
    const { key } = detail;

    if (key === 'Enter') {
      hideWindow(ViewOptions.keyboard.id);
      return;
    }

    setValue((prevValue) => {
      if (key === 'Backspace') {
        return prevValue.slice(0, -1);
      } else if (key === ' ') {
        return `${prevValue} `;
      }

      return `${prevValue}${key}`;
    });
  });

  const handleKeypress = useCallback(
    ({ key }) => {
      if (readOnly) {
        return;
      }

      const inputEvent = new CustomEvent('input', {
        detail: {
          key,
        },
      });

      window.dispatchEvent(inputEvent);
    },
    [readOnly]
  );

  const handleKeydown = useCallback(
    ({ key }) => {
      if (key === 'Backspace') {
        handleKeypress({ key });
      }
    },
    [handleKeypress]
  );

  useEventListener('keypress', handleKeypress);
  useEventListener('keydown', handleKeydown);

  const showKeyboard = useCallback(() => {
    showWindow({
      id: ViewOptions.keyboard.id,
      type: WINDOW_TYPE.KEYBOARD,
    });
  }, [showWindow]);

  return {
    value,
    showKeyboard,
  };
};

export default useKeyboardInput;
