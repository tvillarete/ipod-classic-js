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
  height: 4em;
  width: 4em;
  margin: ${Unit.XS};
`;

const Text = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
`;

const Subtext = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
`;

const SettingsPreview = () => {
  return (
    <Container>
      <Image src="react_logo.svg" />
      <Text>iPod.js</Text>
      <Subtext>by Tanner V</Subtext>
    </Container>
  );
};

export default SettingsPreview;
