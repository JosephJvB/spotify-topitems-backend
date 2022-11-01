import { ISpotifyTrack, SpotifyItemType, SpotifyTopRange } from 'jvb-spotty-models'
import DocClient from '../clients/docClient'
import S3Client from '../clients/s3Client'
import SpotifyClient from '../clients/spotifyClient'
import { ISpotifyJson, ISpotifyProfile } from '../models/ddb'
import { IQuiz, IQuizProfile } from '../models/quiz'

const s3Client = new S3Client()
const docClient = new DocClient()
const spotifyClient = new SpotifyClient()

const newQuiz: IQuiz = {
  ts: getQuizDate(),
  questions: [],
  responses: [],
}

interface ISpotifyProfileWithTracks extends ISpotifyProfile {
  tracks: ISpotifyTrack[]
}

// TODO: Refactor, logic written under time crunch
export const handler = async (): Promise<void> => {
  try {
    // get previous quizzes
    const prevQuizFile: string = await s3Client.tryGetObject(s3Client.bucket, s3Client.quizFile)
    let prevQuiz: IQuiz = null
    if (prevQuizFile) {
      console.log('>  loaded previous quiz')
      prevQuiz = JSON.parse(prevQuizFile)
    }
    const pastQuizzes: IQuiz[] = []
    const pastQuizKeys = await s3Client.getKeys(s3Client.bucket, s3Client.pastQuizPrefix)
    console.log('> ', pastQuizKeys.length, 'past quiz files found')
    for (const k of pastQuizKeys) {
      const r = await s3Client.getObject(s3Client.bucket, k)
      const q = JSON.parse(r)
      pastQuizzes.push(q)
    }
    console.log('> ',pastQuizKeys.length, 'past quiz files downloaded')
    // get all spotify profiles
    const allProfiles = await docClient.scanSpotifyProfiles()
    console.log('>  scan returned', allProfiles.length, 'spotify profiles')
    let numChoices = allProfiles.length
    if (numChoices > 4) numChoices = 4
    console.log('>  each question will have', numChoices, 'choices')
    const profilesWithTracks: ISpotifyProfileWithTracks[] = []
    // request top tracks for all spotify profiles
    for (const profile of allProfiles) {
      const token = JSON.parse(profile.tokenJson) as ISpotifyJson
      const tracks = await spotifyClient.getTopItems(
        token,
        SpotifyItemType.tracks,
        SpotifyTopRange.shortTerm,
        30
      )
      profilesWithTracks.push({
        ...profile,
        tracks: tracks as ISpotifyTrack[]
      })
    }

    console.log('>  loaded topTracks for all spotifyProfiles')
    const questionCount = getSuitableQuestionCount(allProfiles.length)
    console.log('>  creating quiz with', questionCount, 'questions')
    // for each spotifyProfile TRY to find a song that hasn't been an answer for that user before
    // and make sure that song is not already in the quiz from any user (incl. self)
    const inPastQuizzes = (p: ISpotifyProfileWithTracks, t: ISpotifyTrack) => {
      return pastQuizzes.find(q => q.questions.find(ques => {
        return p.spotifyId == ques.answer.spotifyId
          && t.id == ques.track.id
      }))
    }
    while (newQuiz.questions.length < questionCount) {
      for (const p of profilesWithTracks) {
        if (!p.tracks?.length) {
          continue
        }
        const answer = {
          spotifyId: p.spotifyId,
          spotifyDisplayPicture: p.displayPicture,
          spotifyDisplayName: p.displayName,
        }
        let questionTrack = p.tracks.find(t => {
          return !newQuiz.questions.find(ques => t.id == ques.track.id)
            && !inPastQuizzes(p, t)
        })
        if (!questionTrack) {
          questionTrack = p.tracks[Math.floor(Math.random() * p.tracks.length)]
        }
        // assemble multiple choices
        const possibleChoices = profilesWithTracks.filter(pr => pr.spotifyId != p.spotifyId)
        const choices: IQuizProfile[] = [answer]
        let breaker = 10
        while (choices.length < numChoices) {
          if (breaker == 0) {
            break
          }
          breaker--
          const r = Math.floor(Math.random() * possibleChoices.length)
          const nc = possibleChoices[r]
          const duplicate = !!choices.find(c => c.spotifyId == nc.spotifyId)
          if (!duplicate) {
            choices.push({
              spotifyDisplayName: nc.displayName,
              spotifyDisplayPicture: nc.displayPicture,
              spotifyId: nc.spotifyId
            })
          }
        }
        newQuiz.questions.push({
          id: getUuid(),
          track: questionTrack,
          answer,
          choices: shuffle(choices),
        })
      }
    }
    newQuiz.questions = shuffle(newQuiz.questions)
    console.log('>  quiz has', newQuiz.questions.length, 'questions')
    if (prevQuiz) {
      console.log('>  saving old quiz')
      await s3Client.putObject(
        s3Client.bucket,
        s3Client.pastQuizPrefix + prevQuiz.ts + '.json',
        JSON.stringify(prevQuiz)
      )
    }
    console.log('>  saving new quiz')
    await s3Client.putObject(
      s3Client.bucket,
      s3Client.quizFile,
      JSON.stringify(newQuiz)
    )
    console.log('generateQuiz.handler: success')
  } catch (e) {
    console.error(e)
    console.error('generateQuiz.handler failed')
  }
}

function getQuizDate(): string {
  const d = new Date()
  return [
    d.getDate(),
    d.getMonth(),
    d.getFullYear(),
  ].join('-')
}
function getUuid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let uuid = ''
  while(uuid.length < 16) {
    let r = Math.floor(Math.random() * chars.length)
    uuid += chars[r]
  }
  return uuid
}
function getSuitableQuestionCount(numUsers: number): number {
  const possibleQuestionCounts = [20, 21, 22, 19, 18]
  const m = possibleQuestionCounts.find(n => n % numUsers == 0)
  if (!m) {
    console.log('no suitable number of questionsPerPerson found for', numUsers, 'people')
  }
  return m || 20
}
function shuffle(input: any[]): any[] {
  const output = [...input]
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = output[i]
    output[i] = output[j]
    output[j] = temp
  }
  return output
}