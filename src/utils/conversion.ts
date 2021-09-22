import { decode } from 'he';

// Artwork Conversion

/** Accepts a url with '{w}' and '{h}' and replaces them with the specified size */
export const getAppleArtwork = (size: number | string, url?: string) => {
  if (!url) {
    return undefined;
  }

  return url.replace('{w}', `${size || 100}`).replace('{h}', `${size || 100}`);
};

export const convertAppleSong = (data: AppleMusicApi.Song): IpodApi.Song => ({
  id: data.id,
  name: data.attributes?.name ?? 'Unknown name',
  url: data.href ?? '',
  artwork: { url: getAppleArtwork(100, data.attributes?.artwork?.url) ?? '' },
  albumName: data.attributes?.albumName,
  artistName: data.attributes?.artistName,
  duration: data.attributes?.durationInMillis ?? 0,
  trackNumber: data.attributes?.trackNumber ?? 0,
});

export const convertSpotifySongSimplified = (
  data: SpotifyApi.TrackObjectSimplified
): IpodApi.Song => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artistName: data.artists.map(({ name }) => name).join(', '),
  duration: data.duration_ms,
  trackNumber: data.track_number,
});

export const convertSpotifySongFull = (
  data: SpotifyApi.TrackObjectFull
): IpodApi.Song => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artwork: { url: data.album.images[0]?.url ?? '' },
  albumName: data.album.name,
  artistName: data.artists.map(({ name }) => name).join(', '),
  duration: data.duration_ms,
  trackNumber: data.track_number,
});

// Playlist Conversion

export const convertApplePlaylist = (
  data: AppleMusicApi.Playlist
): IpodApi.Playlist => ({
  id: data.id,
  name: data.attributes?.name ?? '–',
  url: data.href ?? '',
  curatorName: data.attributes?.curatorName ?? '',
  artwork: {
    url: getAppleArtwork(100, data.attributes?.artwork?.url) ?? '',
  },
  description: data.attributes?.description?.standard,
  songs: data.relationships?.tracks?.data.map(convertAppleSong) ?? [],
});

export const convertSpotifyPlaylistSimplified = (
  data: SpotifyApi.PlaylistObjectSimplified
): IpodApi.Playlist => ({
  id: data.id,
  name: data.name,
  curatorName: data.owner.display_name ?? '',
  url: data.uri,
  artwork: { url: data.images[0]?.url ?? '' },
  description: data.description ? decode(data.description) : '',
  songs: [],
});

export const convertSpotifyPlaylistFull = (
  data: SpotifyApi.PlaylistObjectFull
): IpodApi.Playlist => ({
  id: data.uri,
  name: data.name,
  curatorName: data.owner.display_name ?? '',
  url: data.uri,
  artwork: { url: data.images[0]?.url ?? '' },
  description: data.description ?? '',
  songs: data.tracks.items.map((item) => convertSpotifySongFull(item.track)),
});

export const convertAppleAlbum = (
  data: AppleMusicApi.Album,
  artworkSize?: number
): IpodApi.Album => ({
  id: data.id,
  name: data.attributes?.name ?? '–',
  artistName: data.attributes?.artistName,
  url: data.href ?? '',
  artwork: {
    url:
      getAppleArtwork(artworkSize ?? 100, data.attributes?.artwork?.url) ?? '',
  },
  songs: data.relationships?.tracks?.data?.map(convertAppleSong) ?? [],
});

export const convertSpotifyAlbumSimplified = (
  data: SpotifyApi.AlbumObjectSimplified
): IpodApi.Album => ({
  id: data.id,
  name: data.name,
  artistName: data.artists.map((artist) => artist.name).join(', '),
  url: data.uri,
  artwork: { url: data.images[0]?.url ?? '' },
  songs: [],
});

export const convertSpotifyAlbumFull = (
  data: SpotifyApi.AlbumObjectFull
): IpodApi.Album => ({
  id: data.id,
  name: data.name,
  artistName: data.artists.map((artist) => artist.name).join(', '),
  url: data.uri,
  artwork: { url: data.images[0]?.url ?? '' },
  songs: data.tracks.items.map((item) => convertSpotifySongSimplified(item)),
});

export const convertAppleArtist = (
  data: AppleMusicApi.Artist
): IpodApi.Artist => ({
  id: data.id,
  name: data.attributes?.name ?? '–',
  url: data.attributes?.url ?? '',
  albums: data.relationships?.albums?.data.map(convertAppleAlbum) ?? [],
});

export const convertSpotifyArtistSimplified = (
  data: SpotifyApi.ArtistObjectSimplified
): IpodApi.Artist => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artwork: undefined,
});

export const convertSpotifyArtistFull = (
  data: SpotifyApi.ArtistObjectFull
): IpodApi.Artist => ({
  id: data.id,
  name: data.name,
  url: data.uri,
  artwork: {
    url: data.images[0]?.url,
  },
});

export const convertAppleMediaItem = (
  mediaItem: MusicKit.MediaItem
): IpodApi.MediaItem => ({
  albumName: mediaItem.albumName,
  artistName: mediaItem.artistName,
  artwork: {
    url: getAppleArtwork(100, mediaItem.artworkURL) ?? '',
  },
  duration: mediaItem.playbackDuration,
  id: mediaItem.id,
  name: mediaItem.title,
  trackNumber: mediaItem.trackNumber,
  url: '',
});

export const convertSpotifyMediaItem = (
  state: Spotify.PlaybackState
): IpodApi.MediaItem => {
  const track = state.track_window.current_track;

  return {
    albumName: track.album.name,
    artistName: track.artists.map(({ name }) => name).join(', '),
    artwork: {
      url: track.album.images[0]?.url ?? '',
    },
    duration: state.duration,
    id: track.id ?? '',
    name: track.name,
    trackNumber: 0,
    url: track.uri,
  };
};

export const convertSpotifySearchResults = (
  results: SpotifyApi.SearchResponse
): IpodApi.SearchResults => {
  return {
    artists: results.artists?.items.map(convertSpotifyArtistFull) ?? [],
    albums: results.albums?.items.map(convertSpotifyAlbumSimplified) ?? [],
    songs: results.tracks?.items.map(convertSpotifySongFull) ?? [],
    playlists:
      results.playlists?.items.map(convertSpotifyPlaylistSimplified) ?? [],
  };
};

export const convertAppleSearchResults = (
  search: AppleMusicApi.SearchResponse
): IpodApi.SearchResults => {
  const { results } = search;

  return {
    artists: results.artists?.data.map(convertAppleArtist) ?? [],
    albums:
      results.albums?.data.map((album) => convertAppleAlbum(album, 100)) ?? [],
    songs: results.songs?.data.map(convertAppleSong) ?? [],
    playlists: results.playlists?.data.map(convertApplePlaylist) ?? [],
  };
};
