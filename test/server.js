// https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

require('dotenv').config({
  path: __dirname + '/../../.env'
})
const fs = require('fs')
const axios = require('axios')
const express = require('express')
const app = express()

app.use(express.json())

const clientId = process.env.clientId
const redirectUri = process.env.baseUrl + '/callback'
const scope = 'user-read-private user-read-email'
app.get('/start', async (req, res) => {
  console.log('get /start')
  const redUrl = 'https://accounts.spotify.com/authorize?'
    + new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: getRandomChars()
    })
  console.log('to here', redUrl)
  res.redirect(redUrl)
})
// http://localhost:3000/callback?code=AQBd581ODkOtds3542y33ispwe73CjpPW3yM32s4Dp62F5JYlE63QV-xByUw4myyS9pFIibQh0WdMfsOn0yzVAU3nRtZtRe5jlWYi61W4RnT5nabYESnmDPRWAevR0VIR3D0L9mNRoVPLyFUhU_8cea943ZO-1xnzdf2py-xYTW6X7q3T92hxTvy-VgVx2Qw39R1HHtOj0hZzhGd7f4ATj8rlPfdsA
// req.query.code, req.query.state
app.get('/callback', async (req, res) => {
  fs.writeFileSync(__dirname + '/data/getCallbackCode.json', JSON.stringify(req.query.code, null, 2))
  console.log('get /callback')
  console.log(req.query)
  try {
    const d = await codeForToken(req.query.code)
    fs.writeFileSync(__dirname + '/data/spottyTokenJson.json', JSON.stringify({...d, ts: Date.now()}, null, 2))
    res.sendStatus(200)
  } catch (e) {
    console.error(e.response.data)
    console.error(e.response.status)
    console.error('failed')
    res.sendStatus(500)
  }
})

app.listen(3000, () => {
  console.log('dev server listening on', 3000)
})

async function codeForToken(code) {
  console.log('code for token', code)
  const auth = Buffer.from(`${clientId}:${process.env.clientSecret}`).toString('base64')
  const r = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    params: {
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`
    }
  })
  return r.data
}
// async function spottyAuth1() {
//   const clientId = process.env.clientId
//   const redirectUri = process.env.baseUrl + '/callback'
//   const scope = 'user-read-private user-read-email'
//   const apiUrl = 'https://accounts.spotify.com/authorize?'
//   const queryParams = new URLSearchParams({
//     response_type: 'code',
//     client_id: clientId,
//     scope: scope,
//     redirect_uri: redirectUri,
//     state: getRandomChars(16)
//   })
//   const r = await axios({
//     url: apiUrl + queryParams,
//     method: 'get'
//   })
//   return r.data
// }
function getRandomChars (n = 16) {
  let s = ''
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  while (s.length < n) {
    const r = Math.floor(Math.random() * chars.length)
    s += chars[r]
  }
  return s
}