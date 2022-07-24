import styled from 'styled-components';
import * as Types from './types';
export * from './types';

export const WheelButton = styled.svg<Types.WheelButtonProps>`
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
