import { APIGatewayProxyResult } from "aws-lambda"
import Artist from "./artist"
import { IQuiz } from "./quiz"
import Track from "./track"

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
export class HttpSuccess<T> extends HttpResponse {
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

export interface IProfileResponse {
  message?: string
  token: string
  email: string
  spotifyId: string
  displayName?: string
  displayPicture?: string
  topTracks?: Track[]
  topArtists?: Artist[]
}
export interface ITopItemsResponse {
  message?: string
  token: string
  items: (Track | Artist)[]
}
export interface IQuizResponse {
  message?: string
  token: string
  quiz: IQuiz
  answered: boolean
}