import { WINDOW_TYPE } from 'App/views';
import { ErrorScreen } from 'components';
import { useMusicKit } from 'hooks/useMusicKit';
import { useWindowService } from 'services/window';
import styled from 'styled-components';

import ActionSheetInterface from './ActionSheetInterface';
import CoverFlowInterface from './CoverFlowInterface';
import FullScreenInterface from './FullScreenInterface';
import PopupInterface from './PopupInterface';
import SplitScreenInterface from './SplitScreenInterface';

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
  const { isConfigured, hasDevToken: hasAppleDevToken } = useMusicKit();
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
  const actionSheetWindows = windowStack.filter(
    (window) => window.type === WINDOW_TYPE.ACTION_SHEET
  );
  const popupWindows = windowStack.filter(
    (window) => window.type === WINDOW_TYPE.POPUP
  );

  const isReady = isConfigured && hasAppleDevToken;

  return (
    <div>
      {isReady ? (
        <>
          <CoverFlowInterface window={coverFlowWindow} />
          <SplitScreenInterface
            windowStack={splitViewWindows}
            menuHidden={fullViewWindows.length > 0}
            allHidden={!!coverFlowWindow}
          />
          <FullScreenInterface windowStack={fullViewWindows} />
          <ActionSheetInterface windowStack={actionSheetWindows} />
          <PopupInterface windowStack={popupWindows} />
        </>
      ) : (
        <ErrorScreen message={'Missing developer token'} />
      )}
      <Mask />
    </div>
  );
};

export default Interface;
