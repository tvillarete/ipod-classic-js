import styled from 'styled-components';

export interface StyledGridProps {
  spacing: number;
  rows: number;
  cols: number;
  width: number;
  height: number;
}

const StyledGrid = styled.div<StyledGridProps>`
  box-sizing: border-box;
  display: grid;
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  grid-template-rows: ${({ rows }) => `repeat(${rows}, 1fr)`};
  grid-template-columns: ${({ cols }) => `repeat(${cols}, 1fr)`};
  grid-gap: ${({ spacing }) => `${spacing}px ${spacing}px`};
  background-color: ${({ theme: { palette } }) => palette.secondary};
  border-radius: ${({ theme: { borderRadius } }) => borderRadius};
  border: ${({ spacing, theme: { palette } }) =>
    `${spacing}px solid ${palette.secondary}`};
`;

export default StyledGrid;
