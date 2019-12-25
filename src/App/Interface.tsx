import React from "react";
import styled from "styled-components";
import { Unit } from "components";
import { useWindowService } from "services/window";

const Container = styled.div`
  position: relative;
  display: flex;
  height: 260px;
  margin: ${Unit.LG} ${Unit.LG} ${Unit.XL};
  border: 4px solid black;
  background: white;
  border-radius: ${Unit.XS};
  overflow: hidden;
  animation: fadeFromBlack 0.5s;

  > div {
    user-select: none;
  }

  @keyframes fadeFromBlack {
    0% {
      filter: brightness(0);
    }
  }
`;

interface WindowContainerProps {
  index: number;
}

const WindowContainer = styled.div<WindowContainerProps>`
  z-index: ${props => props.index};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
`;

const Interface = () => {
  const { windowStack } = useWindowService();

  return (
    <Container>
      {windowStack.map((window, index) => (
        <WindowContainer key={`window-${index}`} index={index}>
          <window.component />
        </WindowContainer>
      ))}
    </Container>
  );
};

export default Interface;
