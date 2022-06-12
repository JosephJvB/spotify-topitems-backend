import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AuthClient from '../clients/authClient'
import { HttpFailure, HttpSuccess, IQuizResponse } from '../models/responses'
import S3Client from '../clients/s3Client'
import { IQuestion, IQuiz } from '../models/quiz'
import { HttpMethod, ISubmitQuizRequest } from '../models/requests'
import LamdbaClient from '../clients/lambdaClient'

const authClient = new AuthClient()
const s3Client = new S3Client()

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

    const tokenData = authClient.verifyJwt(token)
    if (!tokenData) {
      const msg = 'Invalid jwt'
      return new HttpFailure(msg, 401)
    }

    if (event.path == '/quiz/generate') {
      // joe spotify id
      if (tokenData.data.spotifyId != 'xnmacgqaaa6a1xi7uy2k1fe7w') {
        const msg = 'Unauthorized generate quiz request. SpotifyId: ' + tokenData.data.spotifyId
        console.warn(msg)
        return new HttpFailure(msg, 401)
      }
      const lambda = new LamdbaClient()
      await lambda.invoke(process.env.GenerateQuizFnName)
      console.log('Generate quiz success')
      return new HttpSuccess('Generate quiz success')
    }

    // race condition if users submit at the same time,
    // could create a lock file. yolo for now.
    const quizString = await s3Client.getObject(
      s3Client.bucket,
      s3Client.quizFile,
    )
    const quizJson: IQuiz = JSON.parse(quizString) as IQuiz
    const alreadyAnswered = quizJson.responses.find(r => r.spotifyId == tokenData.data.spotifyId)
    if (event.httpMethod == HttpMethod.get) {
      if (alreadyAnswered) {
        const token = authClient.signJwt({ email: tokenData.data.email, spotifyId: tokenData.data.spotifyId })
        return new HttpSuccess<IQuizResponse>({
          message: 'Get success: Quiz already answered',
          token,
          quiz: quizJson,
          answered: !!alreadyAnswered,
        })
      }
      delete quizJson.responses
      for (const q of quizJson.questions) {
        delete q.answer
      }
      return new HttpSuccess<IQuizResponse>({
        message: 'Get success: Quiz not yet answered',
        token,
        quiz: quizJson,
        answered: false,
      })
    }
    if (event.httpMethod == HttpMethod.post) {
      if (alreadyAnswered) {
        const msg = 'User has already answered quiz ' + tokenData.data.spotifyId
        return new HttpFailure(msg, 400)
      }
      const request = JSON.parse(event.body) as ISubmitQuizRequest
      let score = 0
      for (const ra of request.answers) {
        const answerKey = quizJson.questions.find(aq => aq.id == ra.id)
        if (ra.answer.spotifyId == answerKey.answer.spotifyId) {
          score++
        }
      }
      quizJson.responses.push({
        spotifyId: tokenData.data.spotifyId,
        answers: request.answers,
        score
      })
      await s3Client.putObject(
        s3Client.bucket,
        s3Client.quizFile,
        JSON.stringify(quizJson)
      )
      const token = authClient.signJwt({ email: tokenData.data.email, spotifyId: tokenData.data.spotifyId })
      return new HttpSuccess<IQuizResponse>({
        message: 'Quiz submit success',
        token,
        quiz: quizJson,
        answered: true,
      })
    }
    const errResponse = 'method not allowed ' + event.httpMethod
    return new HttpFailure(errResponse, 400)
  } catch (e) {
    console.error(e)
    console.error('quiz.handler failed')
    return new HttpFailure(e, 500)
  }
}