import { ISpotifyArtist } from "./artist";
import { ISpotifyTrack } from "./track";

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