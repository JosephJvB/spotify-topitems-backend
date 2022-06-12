const axios = require('axios')

axios({
  method: 'post',
  url: 'http://localhost:3000/callback',
  data: { test: true }
})
.then(r => {
  console.log('success')
})
.catch(r => {
  console.log('failed')
})