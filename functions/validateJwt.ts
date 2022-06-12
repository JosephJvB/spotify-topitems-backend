import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AuthClient from '../clients/authClient'
import DocClient from '../clients/docClient'
import { HttpMethod } from '../models/requests'
import { HttpFailure, HttpSuccess, IProfileResponse } from '../models/responses'

const authClient = new AuthClient()
const docClient = new DocClient()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(
      `method: ${event.httpMethod}`,
      `path: ${event.path}`,
    )
    console.log('--- event ---')
    console.log(JSON.stringify(event))
    if (event.httpMethod == HttpMethod.options) {
      return new HttpSuccess(null)
    }
    const token = event.headers['Authorization']?.replace('Bearer ', '')
    if (!token) {
      const msg = 'Missing authorization header'
      console.warn(msg)
      return new HttpFailure(msg, 401)
    }

    const tokenData = authClient.verifyJwt(token)
    console.log('tokenData:', tokenData)
    if (!tokenData) {
      const msg = 'JWT invalid'
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }
    if (tokenData.data.expires < Date.now()) {
      const msg = 'JWT expired'
      console.warn(msg)
      return new HttpFailure(msg, 401)
    }

    const spotifyProfile = await docClient.getSpotifyProfile(tokenData.data.spotifyId)
    if (!spotifyProfile) {
      const msg = 'No spotify profile found with id ' + tokenData.data.spotifyId
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }
    const newToken = authClient.signJwt({
      email: tokenData.data.email,
      spotifyId: spotifyProfile.spotifyId,
    })

    return new HttpSuccess<IProfileResponse>({
      message: 'Validate token success',
      token: newToken,
      email: tokenData.data.email,
      displayPicture: spotifyProfile.displayPicture,
      displayName: spotifyProfile.displayName,
      spotifyId: spotifyProfile.spotifyId,
    })
  } catch (e) {
    console.error(e)
    console.error('validateJwt.handler failed')
    return new HttpFailure(e, 500)
  }
}