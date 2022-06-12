import { Lambda } from "aws-sdk"
import { InvocationRequest } from "aws-sdk/clients/lambda"

export default class LamdbaClient {
  private client: Lambda
  constructor() {
    this.client = new Lambda()
  }
  invoke(fnName: string, payload = '') {
    console.log('LambdaClient.invoke')
    const params: InvocationRequest = {
      FunctionName: fnName
    }
    if (payload) {
      params.Payload = payload
    }
    console.log('params', JSON.stringify(params))
    return this.client.invoke(params).promise()
  }
}