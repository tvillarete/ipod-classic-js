import React, { useEffect, useState } from 'react';

import { useQuery } from '@apollo/react-hooks';
import { KenBurns, LoadingIndicator } from 'components';
import { ALBUMS, AlbumsQuery } from 'queries';

const MusicPreview = () => {
  const [artworkUrls, setArtworkUrls] = useState<string[]>([]);
  const { loading, error, data } = useQuery<AlbumsQuery>(ALBUMS);

  useEffect(() => {
    if (data && data.albums && !error) {
      setArtworkUrls(data.albums.map(result => result.artwork));
    }
  }, [data, error]);

  return loading ? (
    <LoadingIndicator backgroundColor="linear-gradient(180deg, #B1B5C0 0%, #686E7A 100%)" />
  ) : (
    <KenBurns urls={artworkUrls} />
  );
};

export default MusicPreview;
