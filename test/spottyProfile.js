require('dotenv').config({ path: __dirname + '/../../.env' })
const axios = require('axios')
// const spotifyJson = require('./data/spottyTokenJson.json')
const spotifyJson = require('./data/mazSpottyTokenJson.json')

const auth = Buffer
      .from(`${process.env.SpotifyClientId}:${process.env.SpotifyClientSecret}`)
      .toString('base64')
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Authorization: `Basic ${auth}`
}

void async function () {
  try {
    // const r = await axios({
    //   method: 'post',
    //   url: 'https://accounts.spotify.com/api/token',
    //   params: {
    //     grant_type: 'refresh_token',
    //     refresh_token: spotifyJson.refresh_token
    //   },
    //   headers
    // })
    // require('fs').writeFileSync(__dirname + '/data/mazSpottyTokenJson.json', JSON.stringify(r.data, null, 2))
    // console.log('updated mazSpottyJson')
    const r = await axios({
      url: 'https://api.spotify.com/v1/me',
      headers: {
        Authorization: 'Bearer ' + spotifyJson.access_token
      }
    })
    console.log(r.data)
  } catch (e) {
    console.error(e.response)
    console.error(e.response.data)
    console.error('failed')
  }
}()