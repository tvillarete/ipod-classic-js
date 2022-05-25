import { useEffect } from 'react';
import { useMenuHideWindowCenter } from 'hooks';
import styled from 'styled-components';
import ViewOptions from '../';
import { Gm } from './src';

const Center = styled.div`


  display: flex;
  justify-content: center;
`

const BrickGame = () => {

  useMenuHideWindowCenter("game2048");
  return (

      <Gm/>

  );
};

export default BrickGame;
