import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import SelectableListItem from "./SelectableListItem";
import { LoadingIndicator } from "components";
import { Song } from "services/audio";

export interface SelectableListOption {
  label: string;
  value: any;
  viewId?: string;
  image?: string;
  songIndex?: number;
  playlist?: Song[];
}

const Container = styled.div`
  width: 100%;
  overflow: auto;
`;

interface Props {
  options: SelectableListOption[];
  activeIndex: number;
  loading?: boolean;
}

const SelectableList = ({ options, activeIndex, loading }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  /** Always make sure the selected item is within the screen's view. */
  useEffect(() => {
    if (containerRef.current && options.length) {
      const { children } = containerRef.current;
      children[activeIndex].scrollIntoView({
        block: "nearest"
      });
    }
  }, [activeIndex, options.length]);

  return loading ? (
    <LoadingIndicator />
  ) : (
    <Container ref={containerRef}>
      {options.map((option, index) => (
        <SelectableListItem
          key={`option-${option.label}-${index}`}
          option={option}
          isActive={index === activeIndex}
        />
      ))}
    </Container>
  );
};

export default SelectableList;
