import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AuthClient from '../clients/authClient'
import DocClient from '../clients/docClient'
import SpotifyClient from '../clients/spotifyClient'
import { HttpMethod, IRegisterRequest } from '../models/requests'
import { HttpFailure, HttpSuccess, IProfileResponse } from '../models/responses'
import { ISpotifyProfile, IUser } from '../models/ddb'

const authClient = new AuthClient()
const docClient = new DocClient()
const spotifyClient = new SpotifyClient()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(
      `method: ${event.httpMethod}`,
      `path: ${event.path}`,
    )
    if (event.httpMethod == HttpMethod.options) {
      return new HttpSuccess(null)
    }
    console.log('--- event ---')
    console.log(JSON.stringify(event))
    console.log('--- body ---')
    console.log(event.body)

    const request = JSON.parse(event.body) as IRegisterRequest
    const missing = ['email', 'password', 'passwordConfirm', 'spotifyCode']
      .filter(k => !request[k])
    if (missing.length) {
      const msg = 'Request is missing properties ' + JSON.stringify(missing)
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }
    const existingUser = await docClient.getUser(request.email)
    if (existingUser) {
      const msg = 'User already exists with email ' + request.email
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }

    const spotifyToken = await spotifyClient.submitCode(request.spotifyCode)
    spotifyToken.ts = Date.now()
    const spotifyJson = JSON.stringify(spotifyToken)

    const spotifyProfile = await spotifyClient.getProfile(spotifyToken)
    const existingSpotifyProfile = await docClient.getSpotifyProfile(spotifyProfile.id)
    if (existingSpotifyProfile) {
      const msg = 'Spotify profile already registered: ' + spotifyProfile.id
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }

    const image = spotifyProfile.images.find(i => !!i.url)
    const salt = await authClient.salt()
    const hash = await authClient.hash(request.password, salt)

    const newUser: IUser = {
      email: request.email,
      hash,
      salt,
      created: Date.now(),
      spotifyId: spotifyProfile.id,
    }
    const newSpotifyProfile: ISpotifyProfile = {
      spotifyId: spotifyProfile.id,
      tokenJson: spotifyJson,
      displayName: spotifyProfile.display_name,
      displayPicture: image && image.url,
    }
    await Promise.all([
      docClient.putUser(newUser),
      docClient.putSpotifyProfile(newSpotifyProfile)
    ])

    const token = authClient.signJwt({
      email: newUser.email,
      spotifyId: newSpotifyProfile.spotifyId,
    })
    
    return new HttpSuccess<IProfileResponse>({
      message: 'Register success',
      token,
      email: newUser.email,
      displayName: newSpotifyProfile.displayName,
      displayPicture: newSpotifyProfile.displayPicture,
      spotifyId: newSpotifyProfile.spotifyId,
    })
  } catch (e) {
    console.error(e)
    console.error('register.handler failed')
    return new HttpFailure(e, 500)
  }
}