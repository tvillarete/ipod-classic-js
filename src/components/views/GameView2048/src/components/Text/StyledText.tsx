import styled, { css } from 'styled-components';
import { Color } from '../../themes/types';

export interface StyledTextProps {
  as?: 'p' | 'span';
  color?: Color;
  fontSize?: number;
  fontWeight?: 'bold' | 'normal';
  textTransform?: 'capitalize' | 'lowercase' | 'uppercase' | 'none';
}

const getFontStyle = ({
  as,
  textTransform,
  fontSize = 14,
  fontWeight,
}: StyledTextProps) => css`
  margin: ${as === 'p' && 0};
  line-height: ${as === 'p' ? 2 : 1.5};
  text-transform: ${textTransform};
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
`;

const StyledText = styled.span<StyledTextProps>`
  line-height: 1.25;
  white-space: nowrap;
  color: ${({ theme: { palette }, color }) => color && palette[color]};
  ${getFontStyle};
`;

export default StyledText;
