/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteShiftButton({ shiftId }: { shiftId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Remove this shift?')) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/volunteers/shifts/${shiftId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-sm font-medium"
    >
      {loading ? '...' : 'Remove'}
    </button>
  )
}
