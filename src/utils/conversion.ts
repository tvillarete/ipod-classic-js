// Artwork Conversion

/** Accepts a url with '{w}' and '{h}' and replaces them with the specified size */
export const getAppleArtwork = (size: number | string, url?: string) => {
  if (!url) {
    return undefined;
  }

  return url.replace('{w}', `${size}`).replace('{h}', `${size}`);
};

export const appleToIpodSong = (data: AppleMusicApi.Song): IpodApi.Song => ({
  id: data.id,
  name: data.attributes?.name ?? 'Unknown name',
  url: data.href ?? '',
  artwork: { url: getAppleArtwork(100, data.attributes?.artwork?.url) ?? '' },
  albumName: data.attributes?.albumName,
  artistName: data.attributes?.artistName,
  duration: data.attributes?.durationInMillis ?? 0,
  trackNumber: data.attributes?.trackNumber ?? 0,
});

export const spotifyToIpodSongSimplified = (
  data: SpotifyApi.TrackObjectSimplified
): IpodApi.Song => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artistName: 'TODO: Artist name',
  duration: data.duration_ms,
  trackNumber: data.track_number,
});

export const spotifyToIpodSong = (
  data: SpotifyApi.TrackObjectFull
): IpodApi.Song => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artwork: { url: data.album.images[0]?.url ?? '' },
  albumName: data.album.name,
  artistName: 'TODO: Artist name',
  duration: data.duration_ms,
  trackNumber: data.track_number,
});

// Playlist Conversion

export const appleToIpodPlaylist = (
  data: AppleMusicApi.Playlist
): IpodApi.Playlist => ({
  id: data.id,
  name: data.attributes?.name ?? '–',
  url: data.attributes?.url ?? '',
  artwork: {
    url: getAppleArtwork(100, data.attributes?.artwork?.url) ?? '',
  },
  description: data.attributes?.description?.standard,
  songs: data.relationships?.tracks?.data.map(appleToIpodSong) ?? [],
});

export const spotifyToIpodPlaylistSimplified = (
  data: SpotifyApi.PlaylistObjectSimplified
): IpodApi.Playlist => ({
  id: data.id,
  name: data.name,
  url: data.href,
  artwork: { url: data.images[0]?.url ?? '' },
  description: data.description ?? '',
  songs: [],
});

export const spotifyToIpodPlaylist = (
  data: SpotifyApi.PlaylistObjectFull
): IpodApi.Playlist => ({
  id: data.uri,
  name: data.name,
  url: data.href,
  artwork: { url: data.images[0]?.url ?? '' },
  description: data.description ?? '',
  songs: data.tracks.items.map((item) => spotifyToIpodSong(item.track)),
});

export const appleToIpodAlbum = (data: AppleMusicApi.Album): IpodApi.Album => ({
  id: data.id,
  name: data.attributes?.name ?? '–',
  url: data.attributes?.url ?? '',
  artwork: {
    url: getAppleArtwork(100, data.attributes?.artwork?.url) ?? '',
  },
  songs: data.relationships?.tracks.data.map(appleToIpodSong) ?? [],
});

export const spotifyToIpodAlbumSimplified = (
  data: SpotifyApi.AlbumObjectSimplified
): IpodApi.Album => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artwork: { url: data.images[0]?.url ?? '' },
  songs: [],
});

export const spotifyToIpodAlbum = (
  data: SpotifyApi.AlbumObjectFull
): IpodApi.Album => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artwork: { url: data.images[0]?.url ?? '' },
  songs: data.tracks.items.map((item) => spotifyToIpodSongSimplified(item)),
});
