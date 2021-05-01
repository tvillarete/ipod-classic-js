import { fade } from 'animation';
import { Header } from 'components';
import { WINDOW_TYPE } from 'components/views';
import { AnimatePresence, motion } from 'framer-motion';
import { WindowOptions } from 'providers/WindowProvider';
import styled from 'styled-components';

const Container = styled(motion.div)`
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface Props {
  window?: WindowOptions;
}

const CoverFlowWindowManager = ({ window }: Props) => {
  const WindowComponent =
    window?.type === WINDOW_TYPE.COVER_FLOW ? window.component : null;

  return (
    <AnimatePresence>
      {!!WindowComponent && (
        <Container {...fade} data-stack-type="coverflow">
          <Header />
          <WindowComponent />
        </Container>
      )}
    </AnimatePresence>
  );
};

export default CoverFlowWindowManager;
