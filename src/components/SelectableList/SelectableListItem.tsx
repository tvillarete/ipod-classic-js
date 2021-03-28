import React from 'react';

import { Unit } from 'components';
import styled, { css } from 'styled-components';

import { SelectableListOption } from './';

interface ContainerProps {
  isActive: boolean;
}

const Label = styled.h3`
  margin: 0;
  padding: ${Unit.XXS};
  font-size: 14px;
`;

const Sublabel = styled(Label)`
  padding: 0 ${Unit.XXS};
  font-weight: normal;
  font-size: 12px;
  color: rgb(100, 100, 100);
`;

const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  overflow: auto;

  ${(props) =>
    props.isActive &&
    css`
      ${Label}, ${Sublabel} {
        color: white;
      }
      background: linear-gradient(rgb(60, 184, 255) 0%, rgb(52, 122, 181) 100%);
    `};
`;

const Image = styled.img`
  height: 3rem;
  width: 3rem;
  margin-right: ${Unit.XXS};
`;

const Icon = styled.img`
  margin-left: auto;
`;

const LabelContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Props {
  option: SelectableListOption;
  isActive: boolean;
}

const SelectableListItem = ({ option, isActive }: Props) => {
  return (
    <Container isActive={isActive}>
      {option.image && <Image src={option.image} />}
      <LabelContainer>
        <Label>{option.label}</Label>
        {option.sublabel && <Sublabel>{option.sublabel}</Sublabel>}
      </LabelContainer>
      {isActive && <Icon src="arrow_right.svg" />}
    </Container>
  );
};

export default SelectableListItem;
