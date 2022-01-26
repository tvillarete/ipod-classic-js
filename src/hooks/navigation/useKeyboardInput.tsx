import { useCallback, useState } from 'react';

import { ViewOptions, WINDOW_TYPE } from 'components';
import { useWindowContext } from 'hooks';
import { useEventListener } from 'hooks/utils';
import { KeyboardViewOptionProps } from 'providers/WindowProvider';

interface KeyboardInputHook {
  value: string;
  showKeyboard: () => void;
  hideKeyboard: () => void;
  updateKeyboard: (
    options: Omit<KeyboardViewOptionProps, 'type' | 'initialValue'>
  ) => void;
}

interface Props {
  initialValue?: string;
  /** By default, we only allow dispatching of keypresses by the keyboard.
   * This can be overridden by setting `readOnly` to false. */
  readOnly?: boolean;
  /** Hide the keyboard when enter is pressed. */
  hideOnEnter?: boolean;
  /** When the keyboard is displayed, choose what title shows in the header. */
  headerTitle?: string;
  /** Hide certain letters or numbers that are by default present on the keyboard. */
  omittedKeys?: string[];
  /** Clear the current text value when the "Enter" key is pressed. */
  clearOnEnter?: boolean;
  onEnterPress?: () => void;
  onChange?: (value: string) => void;
}

const useKeyboardInput = ({
  initialValue = '',
  readOnly = true,
  hideOnEnter = true,
  headerTitle = 'Keyboard',
  omittedKeys = [],
  clearOnEnter = false,
  onEnterPress = () => {},
  onChange = () => {},
}: Props = {}): KeyboardInputHook => {
  const { showWindow, hideWindow, updateWindow, isWindowActive } =
    useWindowContext();
  const [value, setValue] = useState(initialValue);

  useEventListener('input', ({ detail }) => {
    const { key } = detail;

    if (key === 'Enter') {
      if (!isWindowActive(ViewOptions.keyboard.id)) {
        return;
      }

      onEnterPress();

      if (clearOnEnter) {
        setValue('');
      }

      if (hideOnEnter) {
        hideWindow(ViewOptions.keyboard.id);
      }

      return;
    }

    setValue((prevValue) => {
      let newValue = prevValue;

      if (key === 'Backspace' || key === 'delete') {
        newValue = prevValue.slice(0, -1);
      } else if (key === ' ') {
        newValue = `${prevValue} `;
      } else {
        newValue = `${prevValue}${key}`;
      }

      onChange(newValue);
      return newValue;
    });
  });

  const handleKeypress = useCallback(
    ({ key }) => {
      if (readOnly || !isWindowActive(ViewOptions.keyboard.id)) {
        return;
      }

      const inputEvent = new CustomEvent('input', {
        detail: {
          key,
        },
      });

      window.dispatchEvent(inputEvent);
    },
    [readOnly, isWindowActive]
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
      headerTitle,
      type: WINDOW_TYPE.KEYBOARD,
      omittedKeys,
    });
  }, [showWindow, headerTitle, omittedKeys]);

  const updateKeyboard = useCallback(
    (options: Omit<KeyboardViewOptionProps, 'type' | 'initialValue'>) => {
      updateWindow(ViewOptions.keyboard.id, {
        ...options,
      } as any);
    },
    [updateWindow]
  );

  const hideKeyboard = useCallback(() => {
    hideWindow(ViewOptions.keyboard.id);
  }, [hideWindow]);

  return {
    value,
    showKeyboard,
    hideKeyboard,
    updateKeyboard,
  };
};

export default useKeyboardInput;
