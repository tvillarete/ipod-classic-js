import { noAnimation, slideRightAnimation } from "@/animation";
import { motion } from "framer-motion";
import { ViewInstance } from "@/providers/ViewContextProvider";
import { VIEW_REGISTRY, ViewId } from "@/components/views/registry";
import styled from "styled-components";
import { ComponentType } from "react";

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
  viewStack: ViewInstance[];
  index: number;
  isHidden: boolean;
}

const View = ({ viewStack, index, isHidden }: Props) => {
  const viewInstance = viewStack[index];
  const firstInStack = index === 0;

  // Only render screen views
  if (viewInstance.type !== "screen") {
    return null;
  }

  const viewId = viewInstance.id as ViewId;
  const config = VIEW_REGISTRY[viewId];

  if (!config) {
    console.error(`View not found in registry: ${viewId}`, viewInstance);
    return null;
  }

  if (!config.component) {
    console.error(`Component not found for view: ${viewId}`, config);
    return null;
  }

  // Type safety note: We cast Component to accept props as Record<string, unknown>
  // because TypeScript cannot narrow the union of all ViewProps at this boundary.
  // However, type safety IS enforced where it matters - at the showView() call site,
  // which uses conditional types to ensure props match the view ID.
  const Component = config.component as ComponentType<Record<string, unknown>>;
  const props = (viewInstance.props ?? {}) as Record<string, unknown>;

  return (
    <Container
      data-view-id={viewInstance.id}
      index={index}
      {...(firstInStack ? noAnimation : slideRightAnimation)}
    >
      <ContentTransitionContainer $isHidden={isHidden}>
        <Component {...props} />
      </ContentTransitionContainer>
    </Container>
  );
};

export default View;
