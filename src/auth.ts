import NextAuth, { User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function getUser(email: string) {
  try {
    return await sql`SELECT * FROM "user" WHERE email=${email}`
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}

async function getUserWithRole(email: string) {
  try {
    return await sql`
    SELECT u.*, r.name as role
    FROM "user" u
    JOIN role r ON u.role_id = r.id
    WHERE u.email=${email}
    `
  } catch (error) {
    console.error('Failed to fetch user and role:', error)
    throw new Error('Failed to fetch user and role.')
  }
}

async function getAdmin(email: string) {
  try {
    return await sql`
          SELECT
            u.id, 
            u.name, 
            u.email, 
            u.is_active 
          FROM "user" u
          JOIN role r ON r.id = u.role_id
          WHERE u.email = ${email} 
            AND r.name = 'admin' 
          LIMIT 1
        `
  } catch (error) {
    console.error('Failed to fetch admin:', error)
    throw new Error('Failed to fetch admin.')
  }
}

export async function isUserActive(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) {
    return false
  }

  const userArr = await getUser(email)

  if (!userArr?.length || !userArr?.[0]?.is_active) {
    return false
  }

  return true
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          type: 'email',
        },
        password: {
          type: 'password',
        },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null
        }

        const email =
          typeof credentials?.email === 'string' ? credentials?.email : null
        const password =
          typeof credentials?.password === 'string'
            ? credentials?.password
            : null

        if (!email || !password) {
          return null
        }

        if (
          email !== process.env.DEMO_ADMIN_EMAIL ||
          password !== process.env.DEMO_ADMIN_PASSWORD
        ) {
          return null
        }

        const res = await getAdmin(email)

        const user = res?.[0]

        if (!user || !user.is_active) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        } as User
      },
    }),
    Google({
      profile(profile) {
        return profile
      },
    }),
  ],
  callbacks: {
    async signIn({ profile, account }) {
      if (account?.provider === 'credentials') {
        return true
      }

      if (!profile?.name || !profile?.email) {
        return false
      }

      const userArr = await getUser(profile.email)

      if (!userArr?.length) {
        await sql`
            INSERT INTO "user" (name, email)
            VALUES (${profile.name}, ${profile.email})
          `
        return true
      }

      if (!userArr[0]?.is_active) {
        return false
      }

      return true
    },
    async jwt({ token, user }) {

      if (user?.email) {
        const userArr = await getUserWithRole(user.email)

        if (userArr?.length) {
          token.id = userArr[0].id
          token.role = userArr[0].role
        }
      }

      return token
    },
    session({ session, token }) {

      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
})
