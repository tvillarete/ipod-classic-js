import { AnimatePresence } from 'framer-motion';
import { WindowOptions } from 'services/window';
import styled from 'styled-components';

import Popup from '../Popup';

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

const PopupInterface = ({ windowStack }: Props) => {
  const isHidden = windowStack.length === 0;

  return (
    <RootContainer data-stack-type="popup" isHidden={isHidden}>
      <AnimatePresence>
        {windowStack.map((window, index) => (
          <Popup
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

export default PopupInterface;
