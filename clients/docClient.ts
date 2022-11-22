import AWS from 'aws-sdk'
import { DocumentClient, ScanInput } from 'aws-sdk/clients/dynamodb'
import { ISpotifyProfile, IUser } from '../models/ddb'

export enum TableNames {
  JafMembers = 'JafMembers',
  SpotifyProfile = 'SpotifyProfile',
}

export default class DocClient {
  client: DocumentClient
  constructor() {
    AWS.config.update({ region: 'eu-west-2' })
    this.client = new AWS.DynamoDB.DocumentClient()
  }

  async getUser(email: string): Promise<IUser> {
    const r = await this.client.get({
      TableName: TableNames.JafMembers,
      Key: { email }
    }).promise()
    return r && r.Item as IUser
  }
  putUser(user: IUser): Promise<any> {
    return this.client.put({
      TableName: TableNames.JafMembers,
      Item: user
    }).promise()
  }
  async getSpotifyProfile(spotifyId: string): Promise<ISpotifyProfile> {
    const r = await this.client.get({
      TableName: TableNames.SpotifyProfile,
      Key: { spotifyId }
    }).promise()
    return r && r.Item as ISpotifyProfile
  }
  putSpotifyProfile(SpotifyProfile: ISpotifyProfile): Promise<any> {
    return this.client.put({
      TableName: TableNames.SpotifyProfile,
      Item: SpotifyProfile
    }).promise()
  }
  async scanSpotifyProfiles(): Promise<ISpotifyProfile[]> {
    const profiles: ISpotifyProfile[] = []
    let lastKey: DocumentClient.Key = null
    let breaker = 10
    do {
      if (breaker == 0) {
        console.error('breaker hit @ x10 loops')
        break
      }
      breaker--
      const params: ScanInput = { TableName: TableNames.SpotifyProfile }
      if (lastKey) {
        params.ExclusiveStartKey = lastKey
      }
      const r = await this.client.scan(params).promise()
      profiles.push(...r.Items as ISpotifyProfile[])
      lastKey = r.LastEvaluatedKey
    } while (!!lastKey)
    return profiles
  }
}