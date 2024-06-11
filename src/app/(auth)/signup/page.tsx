import Link from 'next/link'

import { auth, signIn, signOut, signUp } from '@/auth'

function SignOut() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut()
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  )
}

export default async function SignupPage() {
  let session = await auth()
  let user = session?.user?.email

  return (
    <div>
      {user ? (
        <SignOut />
      ) : (
        <>
          <form action={signUp}>
            <input type="email" name="email" placeholder="your email" />
            <input type="password" name="password" />
            <input type="password" name="passwordConfirmed" />
            <button type="submit">Submit</button>
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
        </>
      )}

      <Link href={'/'}>
        <button>Home</button>
      </Link>
      <Link href={'/console'}>
        <button>Console</button>
      </Link>
    </div>
  )
}
