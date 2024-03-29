import { useMemo } from "react";

import { SelectableListOption } from "components";
import { motion } from "framer-motion";
import {
  useEventListener,
  useMenuHideView,
  useScrollHandler,
  useViewContext,
} from "hooks";
import styled, { css } from "styled-components";
import { Unit } from "utils/constants";
import { IpodEvent } from "utils/events";
import { ViewOptions } from "providers/ViewContextProvider";
import { slideUpAnimation } from "animation";

interface RootContainerProps {
  index: number;
}

/** Responsible for putting the window at the proper z-index. */
export const RootContainer = styled(motion.div)<RootContainerProps>`
  z-index: ${(props) => props.index};
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

interface ContentTransitionContainerProps {
  $isHidden: boolean;
}

/** Slides the view in from the bottom if it is at the top of the stack. */
const ContentTransitionContainer = styled.div<ContentTransitionContainerProps>`
  position: relative;
  width: 100%;
  padding: ${Unit.XS} 0;
  background: linear-gradient(180deg, #bbbcbf 0%, #626770 11.69%, #626770 100%);
  box-shadow: 0 0px 4px black;
`;

const OptionText = styled.h3`
  margin: 0;
  padding: ${Unit.XS} ${Unit.XXS};
  font-size: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #cbccce 48.44%, #dfdfdf 100%);
  border: 3px solid #3e4249;
  border-radius: 12px;
  text-shadow: 0px 0px 1px #505050;
`;

const OptionContainer = styled.div<{ $highlighted: boolean }>`
  padding: ${Unit.XXS} ${Unit.MD};
  text-align: center;
  border: 3px solid transparent;

  ${({ $highlighted }) =>
    $highlighted &&
    css`
      ${OptionText} {
        background: linear-gradient(
          rgb(60, 184, 255) 0%,
          rgb(52, 122, 181) 100%
        ) !important;
        color: white !important;
        border: 3px solid #ececec;
      }
    `};

  :last-of-type {
    margin-top: ${Unit.XXS};

    ${OptionText} {
      background: linear-gradient(
        180deg,
        #707379 0%,
        #3b3f46 48.44%,
        #363c44 100%
      );
      color: white;
    }
  }
`;

interface Props {
  viewStack: ViewOptions[];
  index: number;
  isHidden: boolean;
}

const ActionSheet = ({ viewStack, index, isHidden }: Props) => {
  const { hideView } = useViewContext();
  const viewOptions = viewStack[index];
  useMenuHideView(viewOptions.id);

  const options: SelectableListOption[] = useMemo(() => {
    const listOptions =
      viewOptions.type === "actionSheet" ? viewOptions.listOptions : [];

    return [
      ...listOptions,
      {
        type: "action",
        label: "Cancel",
        onSelect: () => {},
      },
    ];
  }, [viewOptions]);

  const selectedOption: SelectableListOption | undefined = useMemo(
    () => options.find((option) => option.isSelected === true),
    [options]
  );

  useEventListener<IpodEvent>("centerclick", () => {
    hideView();
  });

  const [scrollIndex] = useScrollHandler(
    viewOptions.id,
    options,
    selectedOption
  );

  return (
    <RootContainer
      data-window-id={viewOptions.id}
      index={index}
      {...slideUpAnimation}
    >
      <ContentTransitionContainer $isHidden={isHidden}>
        {options.map((option, i) => (
          <OptionContainer
            key={`popup-option-${option.label}`}
            $highlighted={scrollIndex === i}
          >
            <OptionText>{option.label}</OptionText>
          </OptionContainer>
        ))}
      </ContentTransitionContainer>
    </RootContainer>
  );
};

export default ActionSheet;
