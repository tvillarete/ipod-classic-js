import styled from 'styled-components';

export type WheelButtonProps = {
  margin?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export const WheelButton = styled.svg<WheelButtonProps>`
  position: absolute;
  margin: ${(props) => props.margin};
  top: ${(props) => props.top};
  bottom: ${(props) => props.bottom};
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  user-select: none;
  pointer-events: none;
  max-height: 13px;
`;
