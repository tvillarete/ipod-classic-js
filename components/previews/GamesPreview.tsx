import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Unit } from 'utils/constants';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  background: linear-gradient(180deg, #b1b5c0 0%, #686e7a 100%);
`;

const Image = styled.img`
  height: 6em;
  width: 6em;
  margin: ${Unit.XS};
`;

const Text = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
`;

const GamesPreview = () => {
  return (
    <Container>
      <Image src="dice.svg" />
      <Text>Games</Text>
    </Container>
  );
};

export default GamesPreview;
