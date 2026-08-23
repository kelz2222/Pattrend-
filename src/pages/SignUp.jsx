import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-10 text-center">
        <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-gray-400 text-sm">
          We sent a confirmation link to {email}. Confirm it, then sign in.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-white mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-panel border border-border text-white rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-panel border border-border text-white rounded px-3 py-2 text-sm"
        />
        {error && <div className="text-bear text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-black font-medium rounded px-3 py-2 text-sm"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/signin" className="text-accent underline">Sign in</Link>
      </p>
    </div>
  )
}
