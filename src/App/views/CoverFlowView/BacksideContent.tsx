import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import {
  LoadingIndicator,
  SelectableList,
  SelectableListOption,
} from 'components';
import { useEventListener, useScrollHandler } from 'hooks';
import { Album, ALBUM, AlbumQuery } from 'queries';
import styled from 'styled-components';

import ViewOptions from '../';

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: -28%;
  bottom: -50%;
  left: -50%;
  right: -50%;
  border: 1px solid lightgray;
  background: white;
  transform: rotateY(180deg);
`;

const InfoContainer = styled.div`
  padding: 4px 8px;
  background: linear-gradient(180deg, #6585ad 0%, #789ab3 100%);
  border-bottom: 1px solid #6d87a3;
`;

const Text = styled.h3`
  font-size: 16px;
  margin: 0;
  color: white;
`;

const Subtext = styled(Text)`
  font-size: 14px;
`;

const ListContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: auto;
`;

interface Props {
  album: Album;
  setPlayingAlbum: (val: boolean) => void;
}

const BacksideContent = ({ album, setPlayingAlbum }: Props) => {
  const { loading, error, data } = useQuery<AlbumQuery>(ALBUM, {
    variables: { name: album.album }
  });
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.coverFlow.id, options);

  useEventListener("centerclick", () => setPlayingAlbum(true));

  useEffect(() => {
    if (data && data.album && !error) {
      setOptions(
        data.album.map((song, index) => ({
          label: song.name,
          value: song,
          songIndex: index,
          playlist: data.album
        }))
      );
    }
  }, [data, error]);

  return (
    <Container>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          <InfoContainer>
            <Text>{album.album}</Text>
            <Subtext>{album.artist}</Subtext>
          </InfoContainer>
          <ListContainer>
            <SelectableList activeIndex={index} options={options} />
          </ListContainer>
        </>
      )}
    </Container>
  );
};

export default BacksideContent;
