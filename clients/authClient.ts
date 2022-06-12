import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IJafToken } from '../models/ddb'

const saltRounds = 10
export default class AuthClient {
  constructor() {}

  salt(): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt: string) => {
        if (err) {
          reject(err)
        } else {
          resolve(salt)
        }
      })
    })
  }
  hash(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, salt, (err, hash: string) => {
        if (err) {
          reject(err)
        } else {
          resolve(hash)
        }
      })
    })
  }
  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
  signJwt(data: any): string {
    data.expires = Date.now() + 1000 * 60 * 60 * 8
    return jwt.sign({ data }, process.env.JwtSecret)
  }
  verifyJwt(token: string): IJafToken | false {
    try {
      return jwt.verify(token, process.env.JwtSecret) as IJafToken
    } catch (e) {
      console.error(e)
      console.error('jwt.verify failed')
      return false
    }
  }
}