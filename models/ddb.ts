import { JwtPayload } from "jsonwebtoken";
import { ISpotifyTokenResponse } from "jvb-spotty-models";

export interface IUser {
  email: string
  hash: string
  salt: string
  created: number
  spotifyId: string
}
export interface IJafToken extends JwtPayload {
  data: {
    email: string
    spotifyId: string
    expires: number
  }
}
export interface ISpotifyJson extends ISpotifyTokenResponse {
  ts: number
}

export interface ISpotifyProfile {
  spotifyId: string
  tokenJson: string
  displayName?: string
  displayPicture?: string
}