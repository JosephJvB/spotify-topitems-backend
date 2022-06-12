require('dotenv').config({ path: __dirname + '/../../.env' })
const Auth = require('../../dist/clients/authClient').AuthClient
const auth = new Auth()
const x = auth.signJwt({
  email: 'joevanbo@gmail.com',
  test: 'eeee'
})
console.log(x)
const y = auth.verifyJwt(x)
console.log(y)