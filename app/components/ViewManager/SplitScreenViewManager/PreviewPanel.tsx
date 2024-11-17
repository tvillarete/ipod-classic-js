import { SplitScreenPreview, Previews } from "components/previews";
import { AnimatePresence } from "framer-motion";
import { useViewContext } from "hooks";
import { Screen } from "utils/constants";
import styled, { css } from "styled-components";

interface ContainerProps {
  $isHidden: boolean;
}

const Container = styled.div<ContainerProps>`
  z-index: 0;
  position: relative;
  flex: 0 0 50%;
  background: white;
  transition: all 0.35s;

  ${(props) =>
    props.$isHidden &&
    css`
      transform: translateX(100%);
      opacity: 0;
      overflow: hidden;
    `};

  ${Screen.XS.MediaQuery} {
    display: none;
  }
`;

interface Props {
  $isHidden: boolean;
}

const PreviewPanel = ({ $isHidden: isHidden }: Props) => {
  const { preview } = useViewContext();
  const PreviewComponent = Previews[preview];

  return (
    <Container $isHidden={isHidden}>
      <AnimatePresence>
        {/* Music preview slides in, whereas the other previews simply appear. */}
        {preview === SplitScreenPreview.Music && <PreviewComponent />}
      </AnimatePresence>
      {preview !== SplitScreenPreview.Music && <PreviewComponent />}
    </Container>
  );
};

export default PreviewPanel;
