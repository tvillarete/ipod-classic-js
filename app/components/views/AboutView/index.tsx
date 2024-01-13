import { SelectableList, SelectableListOption } from "components";
import { viewConfigMap } from "components/views";
import { useMenuHideView, useScrollHandler } from "hooks";
import styled from "styled-components";
import { Unit } from "utils/constants";
import { APP_URL } from "utils/constants/api";

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
  useMenuHideView(viewConfigMap.about.id);
  const options: SelectableListOption[] = [
    {
      type: "link",
      label: "GitHub Repo",
      url: "https://github.com/tvillarete/ipod-classic-js",
    },
    {
      type: "link",
      label: "My Website",
      url: "http://tannerv.com",
    },
    {
      type: "link",
      label: "LinkedIn",
      url: "https://linkedin.com/in/tvillarete",
    },
  ];

  const [scrollIndex] = useScrollHandler(viewConfigMap.about.id, options);

  return (
    <Container>
      <ListContainer>
        <TitleContainer>
          <Image alt="iPod" src={`${APP_URL}/ipod_logo.svg`} />
          <Title>iPod.js</Title>
        </TitleContainer>
        <Description>
          Made with{" "}
          <span aria-label="heart" role="img">
            ❤️
          </span>{" "}
          by Tanner Villarete
        </Description>
        <SelectableList options={options} activeIndex={scrollIndex} />
      </ListContainer>
    </Container>
  );
};

export default AboutView;
