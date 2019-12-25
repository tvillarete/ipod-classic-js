import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import SelectableListItem from "./SelectableListItem";

export interface SelectableListOption {
  label: string;
  value: any;
}

const Container = styled.div`
  width: 100%;
  overflow: auto;
`;

interface Props {
  options: SelectableListOption[];
  activeIndex: number;
}

const SelectableList = ({ options, activeIndex }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  /** Always make sure the selected item is within the screen's view. */
  useEffect(() => {
    if (containerRef.current) {
      const { children } = containerRef.current;
      children[activeIndex].scrollIntoView({
        block: "nearest"
      });
    }
  }, [activeIndex]);

  return (
    <Container ref={containerRef}>
      {options.map((option, index) => (
        <SelectableListItem
          key={`option-${option.label}`}
          option={option}
          isActive={index === activeIndex}
        />
      ))}
    </Container>
  );
};

export default SelectableList;
