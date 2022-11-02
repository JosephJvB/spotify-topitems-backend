import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AuthClient from '../clients/authClient'
import DocClient from '../clients/docClient'
import SpotifyClient from '../clients/spotifyClient'
import { HttpMethod } from '../models/requests'
import { HttpFailure, HttpSuccess, ITopItemsResponse } from '../models/responses'
import { ISpotifyJson } from '../models/ddb'
import { URLSearchParams } from 'url'
import { ISpotifyArtist, ISpotifyTrack, SpotifyItemType, SpotifyTopRange } from 'jvb-spotty-models'

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
    const token = event.headers['Authorization']?.replace('Bearer ', '')
    if (!token) {
      const msg = 'Missing authorization header'
      console.warn(msg)
      return new HttpFailure(msg, 401)
    }
    
    const queryParams = new URLSearchParams(event.queryStringParameters)
    const type = queryParams.get('type') as SpotifyItemType
    const limit = Number(queryParams.get('limit'))
    const range = queryParams.get('range') as SpotifyTopRange
    if (!type) {
      const msg = 'Request is missing "type" parameter'
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }
    const tokenData = authClient.verifyJwt(token)
    if (!tokenData) {
      const msg = 'Invalid jwt'
      return new HttpFailure(msg, 401)
    }
    if (tokenData.data.expires < Date.now()) {
      const msg = 'Invalid request, JWT has expired'
      return new HttpFailure(msg, 401)
    }

    const spotifyProfile = await docClient.getSpotifyProfile(tokenData.data.spotifyId)
    if (!spotifyProfile) {
      const msg = 'Spotify profile not found with id ' + tokenData.data.spotifyId
      console.warn(msg)
      return new HttpFailure(msg, 400)
    }
    const spotifyToken = JSON.parse(spotifyProfile.tokenJson) as ISpotifyJson

    // this logic should be in a service
    // it handles both spotifyClient and docClient
    const tokenBefore = spotifyToken.access_token
    const ts = Date.now()
    const responseItems = await spotifyClient.getTopItems<ISpotifyTrack | ISpotifyArtist>(spotifyToken, type, range, limit)
    if (tokenBefore != spotifyToken.access_token) {
      spotifyToken.ts = ts
      spotifyProfile.tokenJson = JSON.stringify(spotifyToken)
      await docClient.putSpotifyProfile(spotifyProfile)
    }

    const newToken = authClient.signJwt({
      email: tokenData.data.email,
      spotifyId: spotifyProfile.spotifyId,
    })
    
    return new HttpSuccess<ITopItemsResponse>({
      message: 'Top items success',
      token: newToken,
      items: responseItems,
    })
  } catch (e) {
    console.error(e)
    console.error('spotifyTop.handler failed')
    return new HttpFailure(e, 500)
  }
}