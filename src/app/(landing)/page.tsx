import Link from 'next/link'
import { auth, signOut } from '@/auth'

function SignOut({ children }: { children?: React.ReactNode }) {
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

export default async function Landing() {
  let session = await auth()
  let user = session?.user?.email

  return (
    <div>
      <h1>Landing</h1>
      {user ? (
        <SignOut />
      ) : (
        <Link href={'/login'} passHref>
          <button>Login</button>
        </Link>
      )}
      <Link href={'/console'} passHref>
        <button>Console</button>
      </Link>
    </div>
  )
}
