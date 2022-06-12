import AWS from 'aws-sdk'
import { ListObjectsV2Request } from 'aws-sdk/clients/s3'

export enum TableNames {
  JafMembers = 'JafMembers',
  SpotifyProfile = 'SpotifyProfile',
}

export default class S3Client {
  client: AWS.S3
  bucket: string
  quizFile: string
  pastQuizPrefix: string
  constructor() {
    AWS.config.update({ region: 'ap-southeast-2' })
    this.client = new AWS.S3()
    this.bucket = 'joevanbucket'
    this.quizFile = 'spotify-quiz/current.json'
    this.pastQuizPrefix = 'spotify-quiz/past/'
  }

  async tryGetObject(bucket: string, key: string): Promise<string> {
    try {
      const str = await this.getObject(bucket, key)
      return str
    } catch (e) { }
  }
  async getObject(bucket: string, key: string): Promise<string> {
    const r = await this.client.getObject({
      Bucket: bucket,
      Key: key
    }).promise()
    return r && r.Body.toString()
  }
  async putObject(bucket: string, key: string, data: string): Promise<void> {
    await this.client.putObject({
      Bucket: bucket,
      Key: key,
      Body: data
    }).promise()
  }
  async getKeys(bucket: string, prefix: string): Promise<string[]> {
    const keys: string[] = []
    let continueKey: string = null
    let breaker = 3
    do {
      if (breaker == 0) {
        console.error('breaker hit @ x3 loops')
        break
      }
      const params: ListObjectsV2Request = {
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      }
      if (continueKey) {
        params.ContinuationToken = continueKey
      }
      const r = await this.client.listObjectsV2(params).promise()
      for (const c of r.Contents) {
        keys.push(c.Key)
      }
    } while (!!continueKey)
    return keys
  }
}