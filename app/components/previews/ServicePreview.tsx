import { motion } from "framer-motion";
import { useSettings } from "hooks";
import styled from "styled-components";
import { Unit } from "utils/constants";
import appleMusicIcon from "@public/apple_music_icon.svg";
import spotifyIcon from "@public/spotify_icon.svg";

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
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 600;
`;

const Subtext = styled(Text)`
  font-size: 14px;
  font-weight: 400;
`;

const strings = {
  spotify: "Spotify",
  apple: "Apple Music",
  none: "None",
  selected: "Selected service",
};

const ServicePreview = () => {
  const { service } = useSettings();

  const imgProps = service === "spotify" ? spotifyIcon : appleMusicIcon;

  const text = strings[service ?? "none"];

  return (
    <Container>
      <Image
        alt="Service"
        src={imgProps.src}
        height={imgProps.height}
        width={imgProps.width}
      />
      <Text>{text}</Text>
      <Subtext>{strings.selected}</Subtext>
    </Container>
  );
};

export default ServicePreview;
