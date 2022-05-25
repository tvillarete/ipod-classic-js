import styled, { css } from 'styled-components';
import { SpacingValues } from '../../themes/constants';
import { Color, Spacing } from '../../themes/types';

export type Length = string | 0;
export type BoxSpacing = Spacing | 0;

/**
 * inline -> width, left, right
 * block -> height, top, bottom
 * start -> left in inline, top in block
 * end -> right in inline, bottom in block
 */
export interface StyledBoxProps {
  position?: 'relative' | 'absolute' | 'fixed' | 'static' | 'sticky';
  boxSizing?: 'border-box' | 'content-box';
  top?: BoxSpacing;
  left?: BoxSpacing;
  right?: BoxSpacing;
  bottom?: BoxSpacing;
  padding?: BoxSpacing;
  margin?: BoxSpacing;
  paddingInline?: BoxSpacing;
  paddingInlineStart?: BoxSpacing;
  paddingInlineEnd?: BoxSpacing;
  paddingBlock?: BoxSpacing;
  paddingBlockStart?: BoxSpacing;
  paddingBlockEnd?: BoxSpacing;
  marginInline?: BoxSpacing;
  marginInlineStart?: BoxSpacing;
  marginInlineEnd?: BoxSpacing;
  marginBlock?: BoxSpacing;
  marginBlockStart?: BoxSpacing;
  marginBlockEnd?: BoxSpacing;
  inlineSize?: Length;
  blockSize?: Length;
  minInlineSize?: Length;
  minBlockSize?: Length;
  maxInlineSize?: Length;
  maxBlockSize?: Length;
  flexDirection?: 'row' | 'column'; // omit other properties
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'space-between'
    | 'space-evenly'
    | 'space-around';
  alignItems?: 'center' | 'start' | 'end' | 'stretch';
  background?: Color;
  borderRadius?: Length;
}

const getBoxSizeStyles = ({
  position,
  boxSizing,
  top,
  left,
  right,
  bottom,
  inlineSize,
  blockSize,
  minBlockSize,
  minInlineSize,
  maxBlockSize,
  maxInlineSize,
  padding,
  margin,
  paddingBlock,
  paddingInline,
  marginBlock,
  marginInline,
  marginBlockStart = marginBlock,
  marginBlockEnd = marginBlock,
  marginInlineStart = marginInline,
  marginInlineEnd = marginInline,
  paddingBlockStart = paddingBlock,
  paddingBlockEnd = paddingBlock,
  paddingInlineStart = paddingInline,
  paddingInlineEnd = paddingInline,
}: StyledBoxProps) => css`
  position: ${position};
  box-sizing: ${boxSizing};
  top: ${top};
  left: ${left};
  right: ${right};
  bottom: ${bottom};
  width: ${inlineSize};
  height: ${blockSize};
  min-width: ${minInlineSize};
  min-height: ${minBlockSize};
  max-width: ${maxInlineSize};
  max-height: ${maxBlockSize};
  padding: ${padding && SpacingValues[padding]};
  margin: ${margin && SpacingValues[margin]};
  padding-top: ${paddingBlockStart && SpacingValues[paddingBlockStart]};
  padding-bottom: ${paddingBlockEnd && SpacingValues[paddingBlockEnd]};
  padding-left: ${paddingInlineStart && SpacingValues[paddingInlineStart]};
  padding-right: ${paddingInlineEnd && SpacingValues[paddingInlineEnd]};
  margin-top: ${marginBlockStart && SpacingValues[marginBlockStart]};
  margin-bottom: ${marginBlockEnd && SpacingValues[marginBlockEnd]};
  margin-left: ${marginInlineStart && SpacingValues[marginInlineStart]};
  margin-right: ${marginInlineEnd && SpacingValues[marginInlineEnd]};
`;

const StyledBox = styled.div<StyledBoxProps>`
  display: flex;
  flex-direction: ${({ flexDirection = 'row' }) => flexDirection};
  align-items: center;
  justify-content: ${({ justifyContent }) => {
    if (justifyContent === 'start' || justifyContent === 'end') {
      return `flex-${justifyContent}`;
    }
    return justifyContent;
  }};
  align-items: ${({ alignItems }) => alignItems};
  background-color: ${({ theme: { palette }, background = 'background' }) =>
    palette[background]};
  border-radius: ${({ theme, borderRadius }) =>
    borderRadius ?? theme.borderRadius};
  color: ${({ theme: { palette } }) => palette.foreground};
  ${getBoxSizeStyles}
`;

export default StyledBox;
