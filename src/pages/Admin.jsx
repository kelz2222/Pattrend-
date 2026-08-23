import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const { data: userData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: paymentData } = await supabase
      .from('payment_submissions')
      .select('*, profiles(email)')
      .order('submitted_at', { ascending: false })

    setUsers(userData || [])
    setPayments(paymentData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const grantMonth = async (userId, currentPaidUntil) => {
    const base = currentPaidUntil && new Date(currentPaidUntil) > new Date()
      ? new Date(currentPaidUntil)
      : new Date()
    base.setMonth(base.getMonth() + 1)

    await supabase
      .from('profiles')
      .update({ is_paid: true, paid_until: base.toISOString() })
      .eq('id', userId)

    loadData()
  }

  const revokeAccess = async (userId) => {
    await supabase
      .from('profiles')
      .update({ is_paid: false, paid_until: null })
      .eq('id', userId)

    loadData()
  }

  const approvePayment = async (payment) => {
    await supabase
      .from('payment_submissions')
      .update({ status: 'APPROVED', reviewed_at: new Date().toISOString() })
      .eq('id', payment.id)

    await grantMonth(payment.user_id, null)
  }

  const rejectPayment = async (paymentId) => {
    await supabase
      .from('payment_submissions')
      .update({ status: 'REJECTED', reviewed_at: new Date().toISOString() })
      .eq('id', paymentId)

    loadData()
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  const paidCount = users.filter((u) => u.is_paid).length
  const pendingPayments = payments.filter((p) => p.status === 'PENDING')

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">USERS</div>
          <div className="text-2xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">PAID</div>
          <div className="text-2xl font-bold text-white">{paidCount}</div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-400 mb-2">
        PENDING USDT PAYMENTS [{pendingPayments.length}]
      </h2>
      {pendingPayments.length === 0 ? (
        <div className="text-gray-500 text-sm mb-6">No payment submissions awaiting review.</div>
      ) : (
        pendingPayments.map((p) => (
          <div key={p.id} className="bg-panel border border-border rounded-lg p-4 mb-3">
            <div className="text-sm text-white mb-1">{p.profiles?.email}</div>
            <div className="text-xs text-gray-500 mb-1">Amount: {p.amount_usdt} USDT</div>
            <div className="text-xs text-gray-500 mb-3 break-all">Tx ref: {p.tx_reference}</div>
            <div className="flex gap-2">
              <button
                onClick={() => approvePayment(p)}
                className="flex-1 bg-accent text-black text-sm font-medium rounded px-3 py-1.5"
              >
                Approve
              </button>
              <button
                onClick={() => rejectPayment(p.id)}
                className="flex-1 bg-bear text-white text-sm font-medium rounded px-3 py-1.5"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}

      <h2 className="text-sm font-semibold text-gray-400 mb-2 mt-6">Users</h2>
      {users.map((u) => (
        <div key={u.id} className="bg-panel border border-border rounded-lg p-4 mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm text-white">{u.email}</div>
            <span className={`text-xs ${u.is_paid ? 'text-accent' : 'text-gray-500'}`}>
              {u.is_paid ? 'paid' : 'free'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => grantMonth(u.id, u.paid_until)}
              className="text-xs bg-bg border border-border text-white rounded px-2 py-1"
            >
              +1 month
            </button>
            <button
              onClick={() => revokeAccess(u.id)}
              className="text-xs bg-bg border border-border text-bear rounded px-2 py-1"
            >
              Revoke
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
