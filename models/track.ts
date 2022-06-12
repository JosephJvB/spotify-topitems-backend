import { ISpotifyAlbum, ISpotifyArtistTrim } from "./spotifyApi";

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

export default class Track {
  id: string
  albumImageUrl: string
  albumName: string
  releaseDate: string
  artists: string[]
  name: string
  popularity: number
  previewUrl: string
  constructor(data: ISpotifyTrack) {
    this.id = data.id
    const albumImage = data.album.images.find(i => !!i.url)
    this.albumImageUrl = albumImage && albumImage.url
    this.albumName = data.album.name
    this.releaseDate = data.album.release_date
    this.artists = data.artists.map(a => a.name)
    this.name = data.name
    this.popularity = data.popularity
    this.previewUrl = data.preview_url
  }
}