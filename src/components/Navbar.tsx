'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from './ui/button'



const Navbar = () => {

  const { data: session} =  useSession()


  const user: User = session?.user as User // this user is from session callback

  return (
    <nav className='p-4 md:p-6 shadow-md'>
      <div className='conatainer mx-auto flex flex-col md:flex-row justify-between items-center'>
        <a className="text-xl font-bold mb-4 md:mb-0" href="#">FeedBackify</a>
        {
          session ? (
            <>
            <span className='mr-4'>WelCome, {user?.username || user?.email}</span>
            <Button className="w-full md:w-auto" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Link className="w-full md:w-auto" href='/sign-in'>
              <Button>Login</Button>
            </Link>
          ) 
        }
      </div>
    </nav>
  )
}

export default Navbar