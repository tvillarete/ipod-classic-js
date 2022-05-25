import styled, { css } from 'styled-components';
import { Color } from '../../themes/types';

export interface StyledKnobProps {
  active: boolean;
  knobColor: Color;
  activeColor: Color;
  inactiveColor: Color;
}

const getKnobBackground = ({
  active,
  activeColor,
  inactiveColor,
}: StyledKnobProps) => css`
  background-color: ${({ theme: { palette } }) =>
    palette[active ? activeColor : inactiveColor]};
`;

const StyledKnob = styled.span<StyledKnobProps>`
  position: relative;
  box-sizing: border-box;
  display: block;
  width: 40px;
  height: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease-in;
  ${getKnobBackground};

  ::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 100%;
    width: 16px;
    height: 16px;
    transition: all 0.2s ease-in;
    background-color: ${({ theme: { palette }, knobColor }) =>
      palette[knobColor]};
    transform: ${({ active }) => active && 'translateX(20px)'};
  }
`;

export default StyledKnob;
