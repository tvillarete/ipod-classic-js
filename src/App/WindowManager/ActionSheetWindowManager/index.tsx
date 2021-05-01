import { AnimatePresence } from 'framer-motion';
import { WindowOptions } from 'providers/WindowProvider';
import styled from 'styled-components';

import ActionSheet from '../components/ActionSheet';

interface ContainerProps {
  isHidden: boolean;
}

const RootContainer = styled.div<ContainerProps>`
  z-index: 4;
  position: absolute;
  height: 100%;
  width: 100%;
  background: ${({ isHidden }) =>
    isHidden ? 'transparent' : 'rgba(0, 0, 0, 0.5)'};
  transition: all 0.25s ease;
`;

interface Props {
  windowStack: WindowOptions[];
}

const ActionSheetWindowManager = ({ windowStack }: Props) => {
  const isHidden = windowStack.length === 0;

  return (
    <RootContainer data-stack-type="action-sheet" isHidden={isHidden}>
      <AnimatePresence>
        {windowStack.map((window, index) => (
          <ActionSheet
            key={`window-${window.id}`}
            windowStack={windowStack}
            index={index}
            isHidden={index < windowStack.length - 1}
          />
        ))}
      </AnimatePresence>
    </RootContainer>
  );
};

export default ActionSheetWindowManager;
