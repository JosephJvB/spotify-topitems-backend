export interface ISpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface ISpotifyRefreshResponse {
  access_token: string
  token_type: string
  scope: string
  expires_in: number
}

export interface ISpotifyMeResponse {
  country: string
  display_name: string
  email: string
  explicit_content: {
    filter_enabled: boolean
    filter_locked: boolean
  }
  external_urls: {
    spotify: string
  }
  followers: {
    href?: string
    total: number
  }
  href: string
  id: string
  images: ISpotifyImage[]
  product: string
  type: string
  uri: string
}
export enum SpotifyItemType {
  tracks = 'tracks',
  artists = 'artists',
}
export enum SpotifyTopRange {
  shortTerm = 'short_term',
  mediumTerm = 'medium_term',
  longtTerm = 'long_term',
}
export interface ISpotifyTopTracksResponse {
  items: ISpotifyTrack[]
  total: number
  limit: number
  offset: number
  href: string
  previous: string
  next: string
}
export interface ISpotifyTopArtistsResponse {
  items: ISpotifyArtist[]
  total: number
  limit: number
  offset: number
  href: string
  previous: string
  next: string
}

export interface ISpotifyAlbum {
  album_type: string
  artists: ISpotifyArtistTrim[]
  images: ISpotifyImage[]
  name: string
  release_date: string
}
export interface ISpotifyArtistTrim {
  name: string
  type: string
  uri: string
}

export interface ISpotifyImage {
  height?: number
  url: string
  width?: number
}
export interface ISpotifyArtist {
  external_urls: {
    spotify: string
    [key: string]: string
  }
  followers: {
    href: string
    total: number
  }
  genres: string[]
  href: string
  id: string
  images: ISpotifyImage[]
  name: string
  popularity: number
  type: string
  uri: string
}

export interface ISpotifyTrack {
  album: ISpotifyAlbum
  artists: ISpotifyArtistTrim[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: { [key: string]: string }
  external_urls: {
    spotify: string
    [key: string]: string
  }
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string
  track_number: number
  type: string
  uri: string
}
