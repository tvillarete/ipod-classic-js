import { fade } from "@/animation";
import { CoverFlowView, Header } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { ViewInstance } from "@/providers/ViewContextProvider";
import styled from "styled-components";

const Container = styled(motion.div)`
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 100%;
`;

interface Props {
  view?: ViewInstance;
}

const CoverFlowViewManager = ({ view }: Props) => {
  // CoverFlow is a special screen view with id "coverFlow"
  const isCoverFlow = view?.type === "screen" && view.id === "coverFlow";

  return (
    <AnimatePresence>
      {isCoverFlow && (
        <Container {...fade} data-stack-type="coverflow">
          <Header />
          <CoverFlowView />
        </Container>
      )}
    </AnimatePresence>
  );
};

export default CoverFlowViewManager;
