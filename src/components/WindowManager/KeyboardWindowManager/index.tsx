import { AnimatePresence } from 'framer-motion';
import { WindowOptions } from 'providers/WindowProvider';
import styled from 'styled-components';

import KeyboardInput from '../components/KeyboardInput';

interface ContainerProps {
  isHidden: boolean;
}

const RootContainer = styled.div<ContainerProps>`
  z-index: 4;
  position: absolute;
  height: 100%;
  width: 100%;
`;

interface Props {
  windowStack: WindowOptions[];
}

const KeyboardWindowManager = ({ windowStack }: Props) => {
  const isHidden = windowStack.length === 0;

  return (
    <RootContainer data-stack-type="keyboard" isHidden={isHidden}>
      <AnimatePresence>
        {windowStack.map((window, index) => (
          <KeyboardInput
            key={`keyboard-${window.id}`}
            windowStack={windowStack}
            index={index}
            isHidden={index < windowStack.length - 1}
          />
        ))}
      </AnimatePresence>
    </RootContainer>
  );
};

export default KeyboardWindowManager;
