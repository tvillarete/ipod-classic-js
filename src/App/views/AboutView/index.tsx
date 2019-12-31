import React from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption, Unit } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Image = styled.img`
  height: ${Unit.XL};
  width: auto;
  margin: ${Unit.XS};
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${Unit.MD} ${Unit.MD} 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 900;
`;

const Description = styled.h3`
  margin: 0 0 ${Unit.MD};
  font-size: 14px;
  font-weight: normal;
  text-align: center;
`;

const ListContainer = styled.div`
  flex: 1;
`;

const AboutView = () => {
  useMenuHideWindow(ViewOptions.about.id);
  const options: SelectableListOption[] = [
    {
      label: "My Website",
      value: "Website",
      link: "http://tannerv.com"
    },
    {
      label: "LinkedIn",
      value: "LinkedIn",
      link: "https://linkedin.com/in/tvillarete"
    }
  ];

  const [index] = useScrollHandler(ViewOptions.about.id, options);

  return (
    <Container>
      <ListContainer>
        <TitleContainer>
          <Image alt="iPod" src="ipod_logo.svg" />
          <Title>iPod.js</Title>
        </TitleContainer>
        <Description>
          Made with{" "}
          <span aria-label="heart" role="img">
            ❤️
          </span>{" "}
          by Tanner Villarete
        </Description>
        <SelectableList options={options} activeIndex={index} />
      </ListContainer>
    </Container>
  );
};

export default AboutView;
