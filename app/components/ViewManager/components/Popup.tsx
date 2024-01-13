import { useMemo } from "react";

import { popInAnimation } from "animation";
import { SelectableListOption } from "components";
import { motion } from "framer-motion";
import {
  useEventListener,
  useMenuHideView,
  useScrollHandler,
  useViewContext,
} from "hooks";
import { ViewOptions } from "providers/ViewContextProvider";
import styled, { css } from "styled-components";
import { Unit } from "utils/constants";
import { IpodEvent } from "utils/events";

interface RootContainerProps {
  index: number;
}

/** Responsible for putting the view at the proper z-index. */
export const RootContainer = styled(motion.div)<RootContainerProps>`
  z-index: ${(props) => props.index};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ContentTransitionContainerProps {
  $isHidden: boolean;
}

/** Slides the view in from the bottom if it is at the top of the stack. */
const ContentTransitionContainer = styled.div<ContentTransitionContainerProps>`
  position: relative;
  background: linear-gradient(
    180deg,
    #a2a8b7 0%,
    rgba(38, 52, 88, 0.92) 20.6%,
    #28365a 100%
  );
  width: 80%;
  padding: ${Unit.XXS};
  box-shadow: 0px 6px 5px rgba(0, 0, 0, 0.39);
  border: 2.5px solid white;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  text-align: center;
`;

const TitleText = styled.h3`
  margin: ${Unit.XS} 0 ${Unit.XS};
  font-size: 16px;
`;

const DescriptionText = styled(TitleText)`
  margin: ${Unit.XS} 0 ${Unit.XS};
  font-size: 14px;
  font-weight: 400;
`;

const OptionsContainer = styled.div`
  display: flex;
`;

const OptionText = styled.h3`
  margin: 0;
  padding: ${Unit.XS} ${Unit.XXS};
  font-size: 16px;
  background: linear-gradient(180deg, #8c94a8 0%, #334164 44.97%, #445070 100%);
  border: 2px solid #242e47;
  border-radius: 8px;

  text-shadow: 0px 0px 1px #505050;
`;

const OptionContainer = styled.div<{ $highlighted: boolean }>`
  flex: 1;
  text-align: center;
  border: 2px solid transparent;
  margin-top: 8px;

  ${({ $highlighted }) =>
    $highlighted &&
    css`
      ${OptionText} {
        border: 2px solid #ececec;
        filter: brightness(120%);
      }
    `};
`;

interface Props {
  viewStack: ViewOptions[];
  index: number;
  isHidden: boolean;
}

const Popup = ({ viewStack, index, isHidden }: Props) => {
  const viewOptions = viewStack[index];
  useMenuHideView(viewOptions.id);
  const { hideView } = useViewContext();

  if (viewOptions.type !== "popup") {
    throw new Error("Popup option not supplied");
  }

  const listOptions: SelectableListOption[] = useMemo(() => {
    const listOptions =
      viewOptions.type === "popup" ? viewOptions.listOptions : [];

    return listOptions.length
      ? listOptions
      : [
          {
            type: "action",
            label: "Done",
            onSelect: () => {},
          },
        ];
  }, [viewOptions.listOptions, viewOptions.type]);

  const [scrollIndex] = useScrollHandler(viewOptions.id, listOptions);

  useEventListener<IpodEvent>("centerclick", () => {
    hideView();
  });

  return (
    <RootContainer
      data-view-id={viewOptions.id}
      index={index}
      {...popInAnimation}
    >
      <ContentTransitionContainer $isHidden={isHidden}>
        <TitleText>{viewOptions.title}</TitleText>
        <DescriptionText>{viewOptions.description}</DescriptionText>
        <OptionsContainer>
          {listOptions.map((option, i) => (
            <OptionContainer
              key={`popup-option-${option.label}`}
              $highlighted={scrollIndex === i}
            >
              <OptionText>{option.label}</OptionText>
            </OptionContainer>
          ))}
        </OptionsContainer>
      </ContentTransitionContainer>
    </RootContainer>
  );
};

export default Popup;
