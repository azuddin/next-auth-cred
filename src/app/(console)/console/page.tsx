import { auth, signOut } from '@/auth'
import Link from 'next/link'

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

export default async function ConsolePage() {
  let session = await auth()
  let user = session?.user?.email

  return (
    <div>
      <h1>Console</h1>
      {user && <SignOut />}
      <Link href={'/'}>
        <button>Home</button>
      </Link>
    </div>
  )
}
