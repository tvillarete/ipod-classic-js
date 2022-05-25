import styled from 'styled-components';

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  margin: 0;
`;

export default StyledCheckbox;
