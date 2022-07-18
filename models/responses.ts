import { APIGatewayProxyResult } from "aws-lambda"
import { IQuiz } from "./quiz"
import { ISpotifyArtist, ISpotifyTrack } from "./spotifyApi"

export interface ICorsHeaders {
  "Content-Type": string
  "Allow": string
  "Access-Control-Allow-Headers": string
  "Access-Control-Allow-Methods": string
  "Access-Control-Allow-Origin": string
}
export const CorsHeaders: ICorsHeaders = {
  "Content-Type": "application/json",
  "Allow": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*",
}
// node_modules/@types/aws-lambda/trigger/api-gateway-proxy.d.ts
export abstract class HttpResponse implements APIGatewayProxyResult {
  statusCode: number
  body: string
  headers?: {
    [header: string]: boolean | number | string;
} | undefined
  constructor(statusCode: number, body = '', headers = {}) {
    this.statusCode = statusCode
    this.body = body
    this.headers = {...CorsHeaders, ...headers}
  }
}
export class HttpSuccess<T extends IBasicResponse> extends HttpResponse {
constructor(data: T) {
    super(200, data && JSON.stringify(data))
  }
}
export class HttpFailure extends HttpResponse {
  constructor(body?: string, code = 400) {
    super(code, body)
  }
}
export class HttpRedirect extends HttpResponse {
  constructor(url) {
    const headers = { Location: url }
    super(301, null, headers)
  }
}

export interface IBasicResponse {
  message?: string
  token: string
}
export interface IProfileResponse extends IBasicResponse {
  email: string
  spotifyId: string
  displayName?: string
  displayPicture?: string
  topTracks?: ISpotifyTrack[]
  topArtists?: ISpotifyArtist[]
}
export interface ITopItemsResponse extends IBasicResponse {
  items: (ISpotifyTrack | ISpotifyArtist)[]
}
export interface IQuizResponse extends IBasicResponse {
  quiz: IQuiz
  answered: boolean
}
export interface IWebsocketResponse extends IBasicResponse {
  
}