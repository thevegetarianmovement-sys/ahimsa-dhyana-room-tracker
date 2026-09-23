'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.get('username'),
          password: formData.get('password')
        })
      })
      const res = await response.json()
      
      if (!response.ok) {
        setError(res.error || 'Login failed')
      } else {
        // middleware will handle redirection
        window.location.href = res.role === 'ADMIN' ? '/dashboard' : '/volunteer'
      }
    } catch {
      setError('An error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow border max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">AHIMSA DHYANA MAHASABALU</h1>
        <h2 className="text-sm font-medium text-center text-slate-500 mb-8 uppercase tracking-widest">Accommodation Management</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center font-medium text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              name="username" 
              required
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              required
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-800 text-white font-bold px-4 py-2 rounded shadow hover:bg-slate-900 mt-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  )
}
