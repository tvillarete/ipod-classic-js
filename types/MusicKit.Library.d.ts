// Type definitions for MusicKit JS 1.2.3
// Project: https://developer.apple.com/documentation/musickitjs
// Definitions by: Waseem Dahman <https://github.com/wsmd>

declare namespace MusicKit {
  /**
   * This class represents a user's Cloud Library.
   */
  interface Library {
    /**
     * Fetch a library album using its identifier.
     *
     * @param id A library album identifier
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    album(
      id: string,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Album>;
    /**
     * Fetch one or more library albums using their identifiers.
     *
     * @param ids An array of library album identifiers.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    albums(
      ids: string[] | null,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Album[]>;
    /**
     * Fetch a library artist using its identifier.
     *
     * @param id A library artist identifier.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    artist(
      id: string,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Artist>;
    /**
     * Fetch an artist's relationship by using the artist's identifier.
     * This is not accurate – just a stub type.
     */
    artistRelationship(
      id: string,
      relationship: string
    ): Promise<AppleMusicApi.Album[]>;
    /**
     * Fetch one or more library artists using their identifiers.
     *
     * @param ids An array of library artist identifiers.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    artists(
      ids: string[] | null,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Artist[]>;
    /**
     * Fetch a library music video using its identifier.
     *
     * @param id A library music video identifier.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    musicVideo(
      id: string,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Resource>;
    /**
     * Fetch one or more library music videos using their identifiers.
     *
     * @param ids An array of library music video identifiers.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    musicVideos(
      ids: string[] | null,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Resource[]>;
    /**
     * Fetch a library playlist using its identifier.
     *
     * @param id A library playlist identifier.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    playlist(
      id: string,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Playlist>;
    /**
     * Fetch one or more library playlists using their identifiers.
     *
     * @param ids An array of library playlist identifiers.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    playlists(
      ids: string[] | null,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Playlist[]>;
    /**
     * Search the library using a query.
     *
     * @param term The term to search.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    search(
      term: string,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Resource>;
    /**
     * Fetch a library song using its identifier.
     *
     * @param id A library song identifier.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    song(id: string, parameters?: QueryParameters): Promise<AppleMusicApi.Song>;
    /**
     * Fetch one or more library songs using their identifiers.
     *
     * @param ids An array of library song identifiers.
     * @param parameters A query parameters object that is serialized and passed
     * directly to the Cloud Library API.
     */
    songs(
      ids: string[] | null,
      parameters?: QueryParameters
    ): Promise<AppleMusicApi.Song[]>;
  }
}
