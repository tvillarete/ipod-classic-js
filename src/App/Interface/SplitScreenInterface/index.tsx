import React from "react";
import styled from "styled-components";
import { WindowOptions } from "services/window";
import Window from "App/Interface/Window";
import { AnimatePresence } from "framer-motion";

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
        <h3>Preview</h3>
      </RightPanel>
    </Container>
  );
};

export default SplitScreenInterface;
