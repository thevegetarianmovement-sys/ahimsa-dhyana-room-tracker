/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AllocationForm({
  participantId,
  hotels,
  shads
}: {
  participantId: string
  hotels: any[]
  shads: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accType, setAccType] = useState('HOTEL')
  const [selectedHotel, setSelectedHotel] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const router = useRouter()

  const activeHotel = hotels.find(h => h.id === selectedHotel)
  const activeRoom = activeHotel?.rooms.find((r: any) => r.id === selectedRoom)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      type: accType,
      hotelId: selectedHotel,
      roomId: selectedRoom,
      bedId: formData.get('bedId') as string,
      shadId: formData.get('shadId') as string,
      shadBedId: formData.get('shadBedId') as string,
      checkInDate: formData.get('checkInDate') as string,
      checkOutDate: (formData.get('checkOutDate') as string) || '2099-12-31',
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId, data })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to allocate accommodation');
      }
      router.refresh();
      // Successfully allocated
      alert('Accommodation Assigned Successfully!')
      // In a real app we might close a modal or just refresh (revalidatePath handles it)
    } catch (err: any) {
      setError(err.message || 'Failed to allocate accommodation')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-lg border">
      <h3 className="text-xl font-bold mb-4">Assign Accommodation</h3>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Accommodation Type</label>
          <select 
            className="mt-1 block w-full border px-3 py-2 rounded"
            value={accType}
            onChange={(e) => setAccType(e.target.value)}
          >
            <option value="HOTEL">Hotel Bed</option>
            <option value="SHAD">Ground Accommodation (Shad)</option>
          </select>
        </div>
      </div>

      {accType === 'HOTEL' && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Hotel</label>
            <select 
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
              value={selectedHotel}
              onChange={(e) => { setSelectedHotel(e.target.value); setSelectedRoom('') }}
            >
              <option value="">Select Hotel</option>
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Room</label>
            <select 
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              disabled={!selectedHotel}
            >
              <option value="">Select Room</option>
              {activeHotel?.rooms.map((r: any) => <option key={r.id} value={r.id}>{r.number} ({r.gender || 'Any'})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Bed</label>
            <select 
              name="bedId"
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
              disabled={!selectedRoom}
            >
              <option value="">Select Bed</option>
              {activeRoom?.beds.map((b: any) => {
                const isOccupied = b.allocations && b.allocations.length > 0
                return (
                  <option key={b.id} value={b.id} disabled={isOccupied}>
                    {b.number} {isOccupied ? '(Occupied)' : ''}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      )}

      {accType === 'SHAD' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Shad</label>
            <select 
              name="shadId"
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
              id="shad-select"
              onChange={(e) => {
                const s = document.getElementById('shad-bed-select') as HTMLSelectElement
                if (s) s.value = ""
              }}
            >
              <option value="">Select Shad</option>
              {shads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Bed</label>
            <select 
              name="shadBedId"
              id="shad-bed-select"
              className="mt-1 block w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select Bed</option>
              {/* In a real scenario with 300 beds we might want autocomplete, but a dropdown works for now. 
                  For simplicity we'll just map all beds for the chosen shad. 
                  React state could handle this better but doing it raw here: */}
              {shads.map(s => (
                <optgroup key={s.id} label={s.name}>
                  {s.beds.map((b: any) => {
                    const isOccupied = b.allocations && b.allocations.length > 0
                    return (
                      <option key={b.id} value={b.id} disabled={isOccupied}>
                        {b.number} {isOccupied ? '(Occupied)' : ''}
                      </option>
                    )
                  })}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Check-In Date</label>
          <input type="date" name="checkInDate" required defaultValue={today} className="mt-1 block w-full border px-3 py-2 rounded" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Expected Check-Out (Optional)</label>
          <input type="date" name="checkOutDate" className="mt-1 block w-full border px-3 py-2 rounded" />
        </div>
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign Accommodation'}
        </button>
      </div>
    </form>
  )
}
