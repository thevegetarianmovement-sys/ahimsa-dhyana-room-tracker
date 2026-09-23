/* eslint-disable */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteRoomButton({ roomId, hotelId, disabled }: { roomId: string, hotelId: string, disabled: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Error deleting room')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error deleting room')
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={disabled || loading}
      className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
      title={disabled ? "Cannot delete room with occupied beds" : "Delete Room"}
    >
      {loading ? '...' : 'Delete'}
    </button>
  )
}
