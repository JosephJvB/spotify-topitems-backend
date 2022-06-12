import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AuthClient from '../clients/authClient'
import DocClient from '../clients/docClient'
import SpotifyClient from '../clients/spotifyClient'
import { HttpMethod, ILoginRequest } from '../models/requests'
import { HttpFailure, HttpSuccess, IProfileResponse } from '../models/responses'
import { ISpotifyJson } from '../models/ddb'

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

    const request = JSON.parse(event.body) as ILoginRequest
    const missing = ['email', 'password']
      .filter(k => !request[k])
    if (missing.length) {
      const msg = 'Request is missing properties ' + JSON.stringify(missing)
      console.warn(request)
      return new HttpFailure(msg, 400)
    }
    const existingUser = await docClient.getUser(request.email)
    if (!existingUser) {
      const msg = 'Failed to find user with email ' + request.email
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }
    const passwordMatch = await authClient.compare(
      request.password,
      existingUser.hash
    )
    if (!passwordMatch) {
      console.warn('authClient.compare returned false. Password match failed')
      return new HttpFailure('Invalid credentials', 400)
    }

    const spotifyProfile = await docClient.getSpotifyProfile(existingUser.spotifyId)
    if (!spotifyProfile) {
      const msg = 'Spotify profile not found for user ' + JSON.stringify(existingUser)
      console.warn(msg)
      return new HttpFailure('Incomplete user profile', 500)
    }

    // Refresh Spotify Info
    const spotifyToken: ISpotifyJson = JSON.parse(spotifyProfile.tokenJson)
    const meResponse = await spotifyClient.getProfile(spotifyToken)
    // refresh displayPicture - signedUrls will expire
    const newImage = meResponse.images.find(i => !!i.url)
    if (newImage?.url) {
      spotifyProfile.displayPicture = newImage.url
    }
    // Update ddb token
    spotifyProfile.tokenJson = JSON.stringify(spotifyToken)
    await docClient.putSpotifyProfile(spotifyProfile)

    const token = authClient.signJwt({
      email: existingUser.email,
      spotifyId: existingUser.spotifyId,
    })

    return new HttpSuccess<IProfileResponse>({
      message: 'Login success',
      token,
      email: existingUser.email,
      displayPicture: spotifyProfile.displayPicture,
      displayName: spotifyProfile.displayName,
      spotifyId: existingUser.spotifyId,
    })
  } catch (e) {
    console.error(e)
    console.error('login.handler failed')
    return new HttpFailure(e, 500)
  }
}