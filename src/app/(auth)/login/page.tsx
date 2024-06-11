import Link from 'next/link'
import { AuthError } from 'next-auth'

import { auth, signIn, signOut } from '@/auth'

function SignIn() {
  return (
    <div>
      <form
        action={async (formData) => {
          'use server'

          try {
            const res = await signIn('credentials', {
              email: formData.get('email'),
              password: formData.get('password'),
              redirectTo: '/console',
            })
            console.log(JSON.stringify(res))
          } catch (error) {
            if (error instanceof AuthError) {
              switch (error.type) {
                case 'CredentialsSignin':
                  return { error: 'Invalid credentials!' }

                default:
                  return { error: 'Oops! Something went wrong' }
              }
            }

            throw error
          }
        }}
      >
        <p>You are not logged in</p>
        <input type="email" name="email" defaultValue={'ahmad@azuddin.com'} />
        <input type="password" name="password" defaultValue={'ZAQ!xsw2'} />
        <button type="submit">Sign in</button>
      </form>

      <hr />

      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        <button type="submit">Sign in with google</button>
      </form>
    </div>
  )
}

function SignOut({ children }: { children: React.ReactNode }) {
  return (
    <form
      action={async () => {
        'use server'
        await signOut()
      }}
    >
      <p>{children}</p>
      <button type="submit">Sign out</button>
    </form>
  )
}

export default async function LoginPage() {
  let session = await auth()
  let user = session?.user?.email

  return (
    <div>
      {user ? <SignOut>{`Welcome ${user}`}</SignOut> : <SignIn />}{' '}
      <Link href={'/'}>
        <button>Home</button>
      </Link>
      <Link href={'/console'}>
        <button>Console</button>
      </Link>
    </div>
  )
}
