import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db";
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials";
import { nanoid } from 'nanoid'
import bcrypt from "bcryptjs";

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
        }),
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "example@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                const { email, password } = credentials as {
                    email: string;
                    password: string;
                }

                if (!email || !password) {
                    return null;
                }
                const user = await db.user.findFirst({
                    where: {
                        email
                    }
                })

                if (!user) {
                    throw new Error('Invalid credentials');
                }

                const passwordMatch = user.password ? await bcrypt.compare(password, user.password) : false

                if (!passwordMatch) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user?.image || null,
                    username: user?.username || ''
                    // Add other user properties as needed
                };

            },
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
        },
        redirect({url,baseUrl}) {
            return `${baseUrl}/`
        }
    }
}


export const getauthSession = () => getServerSession(authOptions)