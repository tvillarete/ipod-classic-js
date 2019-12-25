import React from "react";
import styled, { css } from "styled-components";
import { Unit } from "components";
import { SelectableListOption } from ".";

interface ContainerProps {
  isActive: boolean;
}

const Container = styled.div<ContainerProps>`
  padding: ${Unit.XXS};
  overflow: auto;

  ${props =>
    props.isActive &&
    css`
      color: white;
      background: linear-gradient(rgb(60, 184, 255) 0%, rgb(52, 122, 181) 100%);
    `};
`;

const Label = styled.h3`
  margin: 0;
  font-size: ${Unit.MD};
`;

interface Props {
  option: SelectableListOption;
  isActive: boolean;
}

const SelectableListItem = ({ option, isActive }: Props) => {
  return (
    <Container isActive={isActive}>
      <Label>{option.label}</Label>
    </Container>
  );
};

export default SelectableListItem;
