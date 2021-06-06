import { ErrorScreen } from 'components';
import { WINDOW_TYPE } from 'components/views';
import { useEventListener, useMusicKit, useWindowContext } from 'hooks';
import styled from 'styled-components';

import ActionSheetWindowManager from './ActionSheetWindowManager';
import CoverFlowWindowManager from './CoverFlowWindowManager';
import FullScreenWindowManager from './FullScreenWindowManager';
import PopupWindowManager from './PopupWindowManager';
import SplitScreenWindowManager from './SplitScreenWindowManager';

/** Prevents the user from scrolling the display with a mouse. */
const Mask = styled.div`
  z-index: 100;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const WindowManager = () => {
  const { isConfigured, hasDevToken: hasAppleDevToken } = useMusicKit();
  const { windowStack, resetWindows } = useWindowContext();
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

  useEventListener('menulongpress', resetWindows);

  return (
    <div>
      {isReady ? (
        <>
          <CoverFlowWindowManager window={coverFlowWindow} />
          <SplitScreenWindowManager
            windowStack={splitViewWindows}
            menuHidden={fullViewWindows.length > 0}
            allHidden={!!coverFlowWindow}
          />
          <FullScreenWindowManager windowStack={fullViewWindows} />
          <ActionSheetWindowManager windowStack={actionSheetWindows} />
          <PopupWindowManager windowStack={popupWindows} />
        </>
      ) : (
        <ErrorScreen message={'Missing developer token'} />
      )}
      <Mask />
    </div>
  );
};

export default WindowManager;
