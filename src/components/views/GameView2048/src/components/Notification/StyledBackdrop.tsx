import styled from 'styled-components';

const StyledBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme: { palette } }) => palette.backdrop};
  opacity: 0.7;
  z-index: -1;
`;

export default StyledBackdrop;
