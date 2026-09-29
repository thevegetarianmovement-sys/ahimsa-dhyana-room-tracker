/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteHotelButton({ hotelId }: { hotelId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete this entire hotel? This will wipe out all rooms, beds, and participant allocations tied to this hotel. This cannot be undone.')) {
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/${hotelId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        throw new Error('Failed to delete hotel')
      }
      router.push('/hotels')
      router.refresh()
    } catch (e: any) {
      alert(e.message)
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
    >
      {loading ? 'Deleting...' : 'Delete Hotel'}
    </button>
  )
}
