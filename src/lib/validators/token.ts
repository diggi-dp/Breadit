import jwt, { Secret } from 'jsonwebtoken'

const tokenSecret = process.env.TOKEN_SECRET as Secret

export const generateToken = (payload: string | object) => {
    return jwt.sign(payload, tokenSecret, { expiresIn: '1d' })
}

export const verifyToken = (token: string ) => {
    return jwt.verify(token, tokenSecret)   
}