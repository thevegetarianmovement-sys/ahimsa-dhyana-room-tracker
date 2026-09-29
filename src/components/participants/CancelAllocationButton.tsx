/* eslint-disable */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelAllocationButton({ allocationId, participantId }: { allocationId: string, participantId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this accommodation assignment?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/allocations/${allocationId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to cancel')
      router.refresh()
    } catch {
      alert('Failed to cancel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="mt-4 bg-red-100 text-red-600 px-4 py-2 rounded text-sm hover:bg-red-200 w-full"
    >
      {loading ? 'Cancelling...' : 'Cancel / Change Allocation'}
    </button>
  )
}
