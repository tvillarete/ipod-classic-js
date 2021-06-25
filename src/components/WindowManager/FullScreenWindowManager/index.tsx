import { Header } from 'components';
import { AnimatePresence } from 'framer-motion';
import { WindowOptions } from 'providers/WindowProvider';
import styled from 'styled-components';

import { Window } from '../components';

interface ContainerProps {
  isHidden: boolean;
}

const Container = styled.div<ContainerProps>`
  z-index: 3;
  position: absolute;
  height: 100%;
  width: 100%;
  background: white;
  transition: all 0.35s;
  transform: ${(props) => props.isHidden && 'translateX(100%)'};
`;

interface Props {
  windowStack: WindowOptions[];
}

const FullScreenWindowManager = ({ windowStack }: Props) => {
  const isHidden = windowStack.length === 0;

  return (
    <Container data-stack-type="fullscreen" isHidden={isHidden}>
      <Header />
      <AnimatePresence>
        {windowStack.map((window, index) => (
          <Window
            key={`window-${window.id}`}
            windowStack={windowStack}
            index={index}
            isHidden={index < windowStack.length - 1}
          />
        ))}
      </AnimatePresence>
    </Container>
  );
};

export default FullScreenWindowManager;
