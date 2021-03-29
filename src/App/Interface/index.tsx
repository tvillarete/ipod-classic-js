import React from 'react';

import { WINDOW_TYPE } from 'App/views';
import { Screen, Unit } from 'components';
import { useMusicKit } from 'hooks/useMusicKit';
import { useWindowService } from 'services/window';
import styled from 'styled-components';

import CoverFlowInterface from './CoverFlowInterface';
import FullScreenInterface from './FullScreenInterface';
import SplitScreenInterface from './SplitScreenInterface';

const Container = styled.div`
  position: relative;
  height: 260px;
  margin: ${Unit.LG} ${Unit.LG} ${Unit.XL};
  border: 4px solid black;
  border-radius: ${Unit.XS};
  overflow: hidden;
  background: white;
  animation: fadeFromBlack 0.5s;

  @keyframes fadeFromBlack {
    0% {
      filter: brightness(0);
    }
  }

  ${Screen.SM} {
    @media screen and (max-height: 750px) {
      margin: ${Unit.SM} ${Unit.SM} ${Unit.XL};
    }
  }
`;

/** Prevents the user from scrolling the display with a mouse. */
const Mask = styled.div`
  z-index: 100;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Interface = () => {
  const { isConfigured } = useMusicKit();
  const { windowStack } = useWindowService();
  const splitViewWindows = windowStack.filter(
    (window) => window.type === WINDOW_TYPE.SPLIT
  );
  const fullViewWindows = windowStack.filter(
    (window) => window.type === WINDOW_TYPE.FULL
  );
  const coverFlowWindow = windowStack.find(
    (window) => window.type === WINDOW_TYPE.COVER_FLOW
  );

  if (!isConfigured) {
    return null;
  }

  return (
    <Container>
      <Mask />
      <CoverFlowInterface window={coverFlowWindow} />
      <SplitScreenInterface
        windowStack={splitViewWindows}
        menuHidden={fullViewWindows.length > 0}
        allHidden={!!coverFlowWindow}
      />
      <FullScreenInterface windowStack={fullViewWindows} />
    </Container>
  );
};

export default Interface;
