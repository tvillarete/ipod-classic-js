import React from 'react';

import Window from 'App/Interface/Window';
import { Header } from 'components';
import { AnimatePresence } from 'framer-motion';
import { WindowOptions } from 'services/window';
import styled, { css } from 'styled-components';

import PreviewPanel from './PreviewPanel';

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
  overflow: hidden;

  ${props =>
    props.isHidden &&
    css`
      transition-delay: 0.05s;
      transform: translateX(-100%);
      box-shadow: none;
    `};
`;

interface Props {
  windowStack: WindowOptions[];
  menuHidden: boolean;
  allHidden: boolean;
}

const SplitScreenInterface = ({
  windowStack,
  menuHidden,
  allHidden
}: Props) => {
  return (
    <Container>
      <LeftPanel isHidden={menuHidden || allHidden}>
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
      <PreviewPanel isHidden={allHidden} />
    </Container>
  );
};

export default SplitScreenInterface;
