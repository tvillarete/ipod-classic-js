import { useCallback, useMemo } from "react";

import LoadingScreen from "@/components/LoadingScreen";
import SelectableList, {
  SelectableListOption,
} from "@/components/SelectableList";
import { useEventListener, useScrollHandler, useViewContext } from "@/hooks";
import styled from "styled-components";

import { IpodEvent } from "@/utils/events";
import { useFetchAlbum } from "@/hooks/utils/useDataFetcher";

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  inset: -28% -50% -38%;
  border: 1px solid #d3d3d3;
  background: white;
  transform: rotateY(180deg);
`;

const InfoContainer = styled.div`
  flex-shrink: 0;
  padding: 4px 8px;
  background: linear-gradient(to bottom, #6585ad, #789ab3);
  border-bottom: 1px solid #6d87a3;
`;

const Text = styled.h3`
  margin: 0;
  font-size: 16px;
  color: white;
`;

const Subtext = styled(Text)`
  font-size: 14px;
`;

const ListContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

interface Props {
  albumId: MediaApi.Album["id"];
  setPlayingAlbum: (val: boolean) => void;
}

const BacksideContent = ({ albumId, setPlayingAlbum }: Props) => {
  const { setHeaderTitle } = useViewContext();

  const { data: album, isLoading } = useFetchAlbum({
    id: albumId,
    inLibrary: true,
  });

  const options: SelectableListOption[] = useMemo(
    () =>
      album?.songs.map((song, index) => ({
        type: "song",
        label: song.name,
        queueOptions: {
          album,
          startPosition: index,
        },
      })) ?? [],
    [album]
  );

  const [scrollIndex] = useScrollHandler("coverFlow", options);

  const handleSelect = useCallback(() => {
    setPlayingAlbum(true);
    setHeaderTitle("Now Playing");
  }, [setHeaderTitle, setPlayingAlbum]);

  useEventListener<IpodEvent>("centerclick", handleSelect);

  return (
    <Container>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <InfoContainer>
            <Text>{album?.name}</Text>
            <Subtext>{album?.artistName}</Subtext>
          </InfoContainer>
          <ListContainer>
            <SelectableList activeIndex={scrollIndex} options={options} />
          </ListContainer>
        </>
      )}
    </Container>
  );
};

export default BacksideContent;
