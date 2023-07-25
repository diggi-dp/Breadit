import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db";
import GoogleProvider from 'next-auth/providers/google'
import { nanoid } from 'nanoid'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/sign-in'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    callbacks: {
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
                session.user.username = token.username
            }
            return session
        },
        async jwt({ token, user }) {
            const dbUser = await db.user.findFirst({
                where: {
                    email: token.email
                }
            })

            if (!dbUser) {
                token.id = user!.id
                return token
            }

            if (!dbUser.username) {
                await db.user.update({
                    where: {
                        id: dbUser.id,
                    },
                    data: {
                        username: nanoid(10)
                    }
                })
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
                username: dbUser.username
            }
        }   ,
        redirect() {
            return '/'
        }
    }
}

// token {
//     id: 'clk9lbjjx0000v7vkcw6hxmsx',
//     name: 'Bhavesh Jasani',
//     email: 'cnctest51@gmail.com',
//     picture: 'https://lh3.googleusercontent.com/a/AAcHTtdp624Z0VtSbmh1d6PmxNsuqnb1yupgja37p76KgJR-=s96-c',
//     username: 'test_username'
//   }
//   session {
//     user: {
//       name: 'Bhavesh Jasani',
//       email: 'cnctest51@gmail.com',
//       image: 'https://lh3.googleusercontent.com/a/AAcHTtdp624Z0VtSbmh1d6PmxNsuqnb1yupgja37p76KgJR-=s96-c'
//     },
//     expires: '2023-08-24T10:32:06.478Z'
//   }

export const getauthSession = () => getServerSession(authOptions)