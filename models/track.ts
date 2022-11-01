import { ISpotifyAlbum, ISpotifyArtistTrim } from "jvb-spotty-models";

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
