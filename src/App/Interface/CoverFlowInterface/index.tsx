import { fade } from 'animation';
import { WINDOW_TYPE } from 'App/views';
import { Header } from 'components';
import { AnimatePresence, motion } from 'framer-motion';
import { WindowOptions } from 'services/window';
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

const CoverFlowInterface = ({ window }: Props) => {
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

export default CoverFlowInterface;
