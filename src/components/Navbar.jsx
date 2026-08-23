import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-panel border-b border-border">
      <Link to="/" className="font-bold text-lg text-white">Pattrend</Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            {profile?.is_admin && (
              <Link to="/admin" className="text-gray-300 hover:text-white">Admin</Link>
            )}
            <Link to="/account" className="text-gray-300 hover:text-white">Account</Link>
            <button onClick={signOut} className="text-gray-300 hover:text-white">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="text-gray-300 hover:text-white">Sign in</Link>
            <Link to="/signup" className="bg-accent text-black px-3 py-1.5 rounded font-medium">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
