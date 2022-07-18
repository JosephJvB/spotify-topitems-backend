import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import AuthClient from "../clients/authClient";
import DocClient from "../clients/docClient";
import { HttpFailure, HttpSuccess, IWebsocketResponse } from "../models/responses";

const authClient = new AuthClient()
const docClient = new DocClient()

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResult> => {
  try {
    console.log('websocket event')
    console.log(event)
    return new HttpSuccess<IWebsocketResponse>({
      token: 'ya'
    })
  } catch (e) {
    console.error(e)
    console.error('websocket handler failed')
    return new HttpFailure(e, 500)
  }
}