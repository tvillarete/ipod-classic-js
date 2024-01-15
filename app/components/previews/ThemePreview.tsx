import { motion } from "framer-motion";
import styled from "styled-components";
import { APP_URL } from "utils/constants/api";

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
    <Image alt="Themes" src={`${APP_URL}/themes_preview.png`} />
  </Container>
);

export default ThemePreview;
