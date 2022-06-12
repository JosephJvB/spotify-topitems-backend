import { IQuestion } from "./quiz";

export enum HttpMethod {
  get = 'GET',
  post = 'POST',
  options = 'OPTIONS',
}
export interface ILoginRequest {
  email: string
  password: string
}
export interface IRegisterRequest {
  email: string
  password: string
  passwordConfirm: string
  spotifyCode: string
}
export interface ISpotifyCodeRequest {
  token: string
  spotifyCode: string
}
export interface IValidateTokenRequest {
  token: string
}
export interface ISubmitQuizRequest {
  answers: IQuestion[]
}