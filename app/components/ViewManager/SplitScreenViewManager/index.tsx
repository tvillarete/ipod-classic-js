import { Header } from "components";
import PreviewPanel from "components/ViewManager/SplitScreenViewManager/PreviewPanel";
import View from "components/ViewManager/components/View";
import { AnimatePresence } from "framer-motion";
import { ViewOptions } from "providers/ViewContextProvider";
import styled, { css } from "styled-components";
import { Screen } from "utils/constants";

const Container = styled.div`
  z-index: 2;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;

  ${Screen.XS.MediaQuery} {
    flex-direction: column;
  }
`;

interface PanelProps {
  $isHidden: boolean;
}

const LeftPanel = styled.div<PanelProps>`
  z-index: 1;
  position: relative;
  flex: 0 0 50%;
  box-shadow: 0 0 24px black;
  transition: all 0.35s;
  overflow: hidden;
  display: grid;
  grid-template-rows: 20px 1fr;

  ${(props) =>
    props.$isHidden &&
    css`
      transition-delay: 0.05s;
      transform: translateX(-100%);
      box-shadow: none;
    `};

  ${Screen.XS.MediaQuery} {
    flex: 1;
  }
`;

const ContentContainer = styled.div`
  position: relative;
`;

interface Props {
  viewStack: ViewOptions[];
  menuHidden: boolean;
  allHidden: boolean;
}

const SplitScreenViewManager = ({
  viewStack,
  menuHidden,
  allHidden,
}: Props) => {
  return (
    <Container data-stack-type="splitscreen">
      <LeftPanel $isHidden={menuHidden || allHidden}>
        <Header />
        <ContentContainer>
          <AnimatePresence>
            {viewStack.map((view, index) => (
              <View
                key={`view-${view.id}`}
                viewStack={viewStack}
                index={index}
                isHidden={index < viewStack.length - 1}
              />
            ))}
          </AnimatePresence>
        </ContentContainer>
      </LeftPanel>
      <PreviewPanel $isHidden={allHidden} />
    </Container>
  );
};

export default SplitScreenViewManager;
