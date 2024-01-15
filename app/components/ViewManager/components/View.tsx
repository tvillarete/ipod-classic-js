import { useMemo } from "react";

import { noAnimation, slideRightAnimation } from "animation";
import { motion } from "framer-motion";
import { ViewOptions } from "providers/ViewContextProvider";
import styled from "styled-components";

interface ContainerProps {
  index: number;
}

/** Responsible for putting the view at the proper z-index. */
export const Container = styled(motion.div)<ContainerProps>`
  z-index: ${(props) => props.index};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
`;

interface ContentTransitionContainerProps {
  $isHidden: boolean;
}

/** Slides the view to the left if it isn't at the top of the stack. */
const ContentTransitionContainer = styled.div<ContentTransitionContainerProps>`
  height: 100%;
  transition: transform 0.3s;
  transform: ${(props) => props.$isHidden && "translateX(-100%)"};
  overflow: auto;
`;

interface Props {
  viewStack: ViewOptions[];
  index: number;
  isHidden: boolean;
}

const View = ({ viewStack, index, isHidden }: Props) => {
  const options = viewStack[index];
  const headerTitle = options.headerTitle;
  const firstInStack = index === 0;

  const ViewComponent = useMemo(() => {
    switch (options.type) {
      case "screen":
        return options.component;
      default:
        return null;
    }
  }, [options]);

  return (
    <Container
      data-view-id={options.id}
      index={index}
      {...(firstInStack ? noAnimation : slideRightAnimation)}
    >
      <ContentTransitionContainer $isHidden={isHidden}>
        <ViewComponent />
      </ContentTransitionContainer>
    </Container>
  );
};

export default View;
