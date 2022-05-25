import { keyframes } from 'styled-components';

export const scaleUp = keyframes`
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
`;

export const pop = keyframes`
  0% {
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
`;

export const fadeOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 0.9;
  }

  to {
    transform: translateY(-50px);
    opacity: 0;
  }
`;
