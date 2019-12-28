import React from 'react';

import Window from 'App/Interface/Window';
import { MusicPreview } from 'App/previews';
import { Header } from 'components';
import { AnimatePresence } from 'framer-motion';
import { WindowOptions } from 'services/window';
import styled from 'styled-components';

const Container = styled.div`
  z-index: 2;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
`;

interface PanelProps {
  isHidden: boolean;
}

const LeftPanel = styled.div<PanelProps>`
  z-index: 1;
  position: relative;
  flex: 0 0 50%;
  box-shadow: 0 0 24px black;
  transition: all 0.35s;
  transition-delay: 0.05s;
  transform: ${props => props.isHidden && "translateX(-100%)"};
  overflow: hidden;
`;

const RightPanel = styled.div`
  z-index: 0;
  position: relative;
  flex: 0 0 50%;
  background: white;
`;

interface Props {
  windowStack: WindowOptions[];
  isHidden: boolean;
}

const SplitScreenInterface = ({ windowStack, isHidden }: Props) => {
  return (
    <Container>
      <LeftPanel isHidden={isHidden}>
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
      </LeftPanel>
      <RightPanel>
        <MusicPreview />
      </RightPanel>
    </Container>
  );
};

export default SplitScreenInterface;
