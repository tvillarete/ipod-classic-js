import styled from 'styled-components';
import { fadeOut } from '../../utils/animation';

const StyledScore = styled.div`
  position: absolute;
  left: 0;
  bottom: 10px;
  width: 100%;
  text-align: center;
  background: none;
  transition: all 0.2s ease-in;
  animation-name: ${fadeOut};
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
`;

export default StyledScore;
