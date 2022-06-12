const q = require('./data/current.json')

let score = 0
for (const ra of q.responses[0].answers) {
  const answerKey = q.questions.find(aq => aq.id == ra.id)
  if (ra.answer.spotifyId == answerKey.answer.spotifyId) {
    console.log('correct:', ra.track.name)
    score++
  } else {
    console.log('wrong:', ra.track.name)

  }
}