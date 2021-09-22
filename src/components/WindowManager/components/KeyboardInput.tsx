import { useCallback, useEffect, useMemo, useRef } from 'react';

import { popInAnimation } from 'animation';
import { SelectableListOption } from 'components';
import { WINDOW_TYPE } from 'components/views';
import { motion } from 'framer-motion';
import { useKeyboardInput, useMenuHideWindow, useScrollHandler } from 'hooks';
import { WindowOptions } from 'providers/WindowProvider';
import styled, { css } from 'styled-components';
import { Unit } from 'utils/constants';

interface RootContainerProps {
  index: number;
}

/** Responsible for putting the window at the proper z-index. */
export const RootContainer = styled(motion.div)<RootContainerProps>`
  z-index: ${(props) => props.index};
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ContentTransitionContainerProps {
  isHidden: boolean;
}

/** Slides the view in from the bottom if it is at the top of the stack. */
const ContentTransitionContainer = styled.div<ContentTransitionContainerProps>`
  position: relative;
  width: 95%;
  padding: 12px 8px;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #a9a9a9 9.7%,
    #232323 50.24%,
    #181d1b 89.58%
  );
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.39);
  border-radius: 8px;
  color: white;
`;

const OptionsContainer = styled.div`
  display: flex;
  background: linear-gradient(180deg, #000000 0%, rgba(102, 102, 102, 0) 100%);
  border: 1px solid #454545;
  box-sizing: border-box;
  box-shadow: inset 0px 0px 3px #000000;
  border-radius: 4px;
  overflow: hidden;
`;

const OptionText = styled.h3`
  margin: 0;
  line-height: 0.6;
  padding: ${Unit.XS} ${Unit.XXS};
  font-size: 16px;
  border-radius: 8px;
  width: 20px;
`;

const OptionContainer = styled.div<{ highlighted: boolean }>`
  text-align: center;

  ${({ highlighted }) =>
    highlighted &&
    css`
      background: linear-gradient(180deg, #8aebf7 0%, #258af9 100%);
      border-radius: 4px;
    `};
`;

const keyboardOptions = [
  { key: 'Enter', label: '✓' },
  { key: 'delete', label: '⌫' },
  { key: ' ', label: '␣' },
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' },
  { key: 'd', label: 'D' },
  { key: 'e', label: 'E' },
  { key: 'f', label: 'F' },
  { key: 'g', label: 'G' },
  { key: 'h', label: 'H' },
  { key: 'i', label: 'I' },
  { key: 'j', label: 'J' },
  { key: 'k', label: 'K' },
  { key: 'l', label: 'L' },
  { key: 'm', label: 'M' },
  { key: 'n', label: 'N' },
  { key: 'o', label: 'O' },
  { key: 'p', label: 'P' },
  { key: 'q', label: 'Q' },
  { key: 'r', label: 'R' },
  { key: 's', label: 'S' },
  { key: 't', label: 'T' },
  { key: 'u', label: 'U' },
  { key: 'v', label: 'V' },
  { key: 'w', label: 'W' },
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y' },
  { key: 'z', label: 'Z' },
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6', label: '6' },
  { key: '7', label: '7' },
  { key: '8', label: '8' },
  { key: '9', label: '9' },
  { key: '0', label: '0' },
];

interface Props {
  windowStack: WindowOptions[];
  index: number;
  isHidden: boolean;
}

const KeyboardInput = ({ windowStack, index, isHidden }: Props) => {
  const windowOptions = windowStack[index];
  useMenuHideWindow(windowOptions.id);
  const containerRef = useRef<HTMLDivElement>(null);

  if (windowOptions.type !== WINDOW_TYPE.KEYBOARD) {
    throw new Error('Keyboard option not supplied');
  }

  useKeyboardInput({
    initialValue: windowOptions.initialValue,
    readOnly: false,
  });

  const handleSelect = useCallback(
    (key: string) => {
      switch (key) {
        default:
          const inputEvent = new CustomEvent('input', {
            detail: {
              id: windowOptions.id,
              key,
            },
          });
          window.dispatchEvent(inputEvent);
          break;
      }
    },
    [windowOptions.id]
  );

  const listOptions: SelectableListOption[] = useMemo(() => {
    return keyboardOptions.map((option) => ({
      type: 'Action',
      label: option.label,
      onSelect: () => handleSelect(option.key),
    }));
  }, [handleSelect]);

  const [scrollIndex] = useScrollHandler(windowOptions.id, listOptions);

  /** Always make sure the selected item is within the screen's view. */
  useEffect(() => {
    if (containerRef.current) {
      const { children } = containerRef.current;
      children[scrollIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [scrollIndex]);

  return (
    <RootContainer
      data-window-id={windowOptions.id}
      index={index}
      {...popInAnimation}
    >
      <ContentTransitionContainer isHidden={isHidden}>
        <OptionsContainer ref={containerRef}>
          {listOptions.map((option, i) => (
            <OptionContainer
              key={`keyboard-option-${option.label}`}
              highlighted={scrollIndex === i}
            >
              <OptionText>{option.label}</OptionText>
            </OptionContainer>
          ))}
        </OptionsContainer>
      </ContentTransitionContainer>
    </RootContainer>
  );
};

export default KeyboardInput;
