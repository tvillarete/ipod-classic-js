import { motion } from 'framer-motion';
import styled from 'styled-components';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
`;

const Image = styled.img`
  height: 100%;
  width: 100%;
`;

const ThemePreview = () => (
  <Container>
    <Image src="themes_preview.png" />
  </Container>
);

export default ThemePreview;
