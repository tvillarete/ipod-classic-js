import styled from 'styled-components';
import { scaleUp } from '../../utils/animation';

const StyledModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  z-index: 9999;
  animation-name: ${scaleUp};
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default StyledModal;
