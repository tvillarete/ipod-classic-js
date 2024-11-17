import { fade } from "animation";
import { CoverFlowView, Header } from "components";
import { AnimatePresence, motion } from "framer-motion";
import { ViewOptions } from "providers/ViewContextProvider";
import styled from "styled-components";

const Container = styled(motion.div)`
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 100%;
`;

interface Props {
  view?: ViewOptions;
}

const CoverFlowViewManager = ({ view }: Props) => {
  const ViewComponent = view?.type === "coverFlow" ? CoverFlowView : null;

  return (
    <AnimatePresence>
      {!!ViewComponent && (
        <Container {...fade} data-stack-type="coverflow">
          <Header />
          <ViewComponent />
        </Container>
      )}
    </AnimatePresence>
  );
};

export default CoverFlowViewManager;
