/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteParticipantButton({ participantId }: { participantId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to completely delete this participant? This will also remove any of their active bed allocations. This cannot be undone.')) {
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/participants/${participantId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        throw new Error('Failed to delete participant')
      }
      router.push('/participants')
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
      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200 mt-6 w-full"
    >
      {loading ? 'Deleting...' : 'Delete Participant Profile'}
    </button>
  )
}
