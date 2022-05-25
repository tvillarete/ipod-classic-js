import styled from 'styled-components';

const StyledCell = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme: { palette } }) => palette.tertiary};
  border-radius: ${({ theme: { borderRadius } }) => borderRadius};
  opacity: 0.3;
`;

export default StyledCell;
