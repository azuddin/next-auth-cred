import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z, ZodError } from 'zod'

import prisma from './db'

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
  },

  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user

      const isOnApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
      const isOnPublicRoute = ['/'].includes(nextUrl.pathname)
      const isOnAuthRoute = ['/login', '/signup'].includes(nextUrl.pathname)

      if (isOnApiAuthRoute) {
        return true
      }

      if (isOnAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/console', nextUrl))
        }
        return true
      }

      if (!isLoggedIn && !isOnPublicRoute) {
        return Response.redirect(new URL('/login', nextUrl))
      }

      return true
    },
  },

  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials): Promise<any> => {
        try {
          const validated = z
            .object({
              email: z
                .string({ required_error: 'Email is required' })
                .min(1, 'Email is required')
                .email('Invalid email'),
              password: z
                .string({ required_error: 'Password is required' })
                .min(1, 'Password is required')
                .min(8, 'Password must be more than 8 characters')
                .max(32, 'Password must be less than 32 characters'),
            })
            .safeParse(credentials)

          if (validated.success) {
            const { email, password } = validated.data

            const user = await prisma.user.findUnique({
              where: {
                email: email,
                // password:
              },
            })

            if (!user || !user.password) return null

            const bcrypt = require('bcrypt')
            const matched = await bcrypt.compare(password, user.password)

            if (matched) return user
          }

          return null
        } catch (error) {
          if (error instanceof ZodError) {
            return null
          }
        }
      },
    }),
  ],
})

export async function signUp(formData: FormData): Promise<string | undefined> {
  'use server'

  const parsedCredentials = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(formData)

  if (parsedCredentials.success) {
    const { email, password } = parsedCredentials.data

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (user) return 'Email already in use'

    const bcrypt = require('bcrypt')

    const userCreated = await prisma.user.create({
      data: {
        email: email,
        password: await bcrypt.hash(password, 10),
      },
    })

    console.log(userCreated, '<< userCreated')
    return
  }

  return 'Malformed signup data'
}
