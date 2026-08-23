import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const USDT_ADDRESS = 'TFz6KkZzdG5xvbfmE6CNhzkTxrAtPk8r1T'

export default function Account() {
  const { user, profile, isPaid } = useAuth()
  const [txRef, setTxRef] = useState('')
  const [amount, setAmount] = useState('15')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return <div className="max-w-sm mx-auto px-4 py-10 text-gray-400">Sign in to view your account.</div>
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('payment_submissions').insert({
      user_id: user.id,
      tx_reference: txRef,
      amount_usdt: parseFloat(amount),
    })
    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-white mb-1">Account</h1>
      <p className="text-gray-400 text-sm mb-6">{user.email}</p>

      <div className="bg-panel border border-border rounded-lg p-4 mb-6 flex items-center justify-between">
        <span className="text-white font-medium">Paid plan</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${isPaid ? 'bg-accent text-black' : 'border border-border text-gray-400'}`}>
          {isPaid ? 'Active' : 'Free'}
        </span>
      </div>

      {!isPaid && (
        <div className="bg-panel border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-2">Upgrade — $15/month USDT</h2>
          <p className="text-xs text-gray-500 mb-3">
            Send 15 USDT (TRC20) to:<br />
            <span className="font-mono text-gray-300 break-all">{USDT_ADDRESS}</span>
          </p>
          {submitted ? (
            <div className="text-accent text-sm">
              Submitted — an admin will verify and activate your plan shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <input
                type="text"
                placeholder="Transaction reference / hash"
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                required
                className="w-full bg-bg border border-border text-white rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-bg border border-border text-white rounded px-3 py-2 text-sm"
              />
              {error && <div className="text-bear text-sm">{error}</div>}
              <button type="submit" className="w-full bg-accent text-black font-medium rounded px-3 py-2 text-sm">
                Submit payment
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
