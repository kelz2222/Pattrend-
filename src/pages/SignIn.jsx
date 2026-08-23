import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-white mb-6">Sign in</h1>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-panel border border-border text-white rounded px-3 py-2 text-sm"
        />
        {error && <div className="text-bear text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-black font-medium rounded px-3 py-2 text-sm"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        No account? <Link to="/signup" className="text-accent underline">Sign up</Link>
      </p>
    </div>
  )
}
