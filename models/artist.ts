import { ISpotifyImage } from "./spotifyApi";

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

export default class Artist {
  followers: number
  genres: string[]
  imageUrl: string
  name: string
  popularity: number
  constructor(data: ISpotifyArtist) {
    this.followers = data.followers.total
    this.genres = data.genres
    const firstImage = data.images.find(i => !!i.url)
    this.imageUrl = firstImage && firstImage.url
    this.name = data.name
    this.popularity = data.popularity
  }
}