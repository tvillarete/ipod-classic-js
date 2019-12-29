import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import { LoadingIndicator } from 'components';
import { Album, ALBUMS, AlbumsQuery } from 'queries';
import styled from 'styled-components';

import CoverFlow from './CoverFlow';

const Container = styled.div`
  flex: 1;
`;

const CoverFlowView = () => {
  const { loading, error, data } = useQuery<AlbumsQuery>(ALBUMS);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (data && data.albums && !error) {
      setAlbums(data.albums);
    }
  }, [data, error]);

  return (
    <Container>
      {loading ? (
        <LoadingIndicator backgroundColor="white" />
      ) : (
        <CoverFlow albums={albums} />
      )}
    </Container>
  );
};

export default CoverFlowView;
