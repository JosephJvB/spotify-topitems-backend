require('dotenv').config({
  path: __dirname + '/../../.env'
})
const axios = require('axios')

const clientId = process.env.clientId
const redirectUri = process.env.baseUrl + '/callback'
const scope = 'user-read-private user-read-email'
const apiUrl = 'https://accounts.spotify.com/authorize?'
const queryParams = new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  scope: scope,
  redirect_uri: redirectUri,
  state: getRandomChars(16)
})

void async function () {
  const r = await axios({
    url: apiUrl + queryParams,
    method: 'get'
  })
  console.log(r.data)
  require('fs').writeFileSync(__dirname + '/data/' + 'authres.html', r.data)
}()


function getRandomChars (n = 16) {
  let s = ''
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  while (s.length < n) {
    const r = Math.floor(Math.random() * chars.length)
    s += chars[r]
  }
  return s
}