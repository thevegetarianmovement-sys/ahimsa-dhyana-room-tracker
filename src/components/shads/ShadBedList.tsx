/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import ShareAllocationButton from '../ShareAllocationButton'
import { useRouter } from 'next/navigation'

export default function ShadBedList({ beds, shadId, shad }: { beds: any[], shadId: string, shad: any }) {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL') // ALL, AVAILABLE, OCCUPIED, CHECKOUT_TODAY
  const [selectedBed, setSelectedBed] = useState<any>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [regData, setRegData] = useState({ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' })

  async function handleCheckOut(allocId: string) {
    if (!confirm("Are you sure you want to check out this participant?")) return
    setCheckingOut(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/allocations/${allocId}/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locationId: shadId })
      });
      if (!res.ok) throw new Error('Error checking out');
      setSelectedBed(null);
      router.refresh();
    } catch (e) {
      console.error(e)
      alert("Error checking out")
    }
    setCheckingOut(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegistering(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/allocations/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: regData, locationId: shadId, bedId: selectedBed.id, type: 'SHAD' })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error registering');
      }
      setSelectedBed(null)
      setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' })
      router.refresh();
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Error registering and allocating")
    }
    setRegistering(false)
  }

  const filteredBeds = beds.filter(bed => {
    const isOccupied = bed.allocations.length > 0
    let checkoutToday = false

    if (isOccupied) {
      const alloc = bed.allocations[0]
      const today = new Date().toISOString().split('T')[0]
      const checkOutDateStr = typeof alloc.checkOutDate === 'string' ? alloc.checkOutDate : new Date(alloc.checkOutDate).toISOString()
      const checkout = checkOutDateStr.split('T')[0]
      if (today === checkout) checkoutToday = true
    }

    if (filter === 'ALL') return true
    if (filter === 'AVAILABLE') return !isOccupied
    if (filter === 'OCCUPIED') return isOccupied
    if (filter === 'CHECKOUT_TODAY') return checkoutToday
    return true
  })

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Beds</h2>
        <div className="bg-slate-200 p-1 rounded-lg flex space-x-1">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('AVAILABLE')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'AVAILABLE' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Available
          </button>
          <button 
            onClick={() => setFilter('OCCUPIED')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'OCCUPIED' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Occupied
          </button>
          <button 
            onClick={() => setFilter('CHECKOUT_TODAY')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'CHECKOUT_TODAY' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Checkout Today
          </button>
        </div>
      </div>
      
      {filteredBeds.length === 0 && (
        <div className="p-8 text-center text-slate-500 bg-white border rounded-lg border-dashed">
          No beds match this filter.
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {filteredBeds.map(bed => {
          let statusColor = 'bg-green-500' // Available
          let statusLabel = 'Available'
          let occupantName = ''
          
          let occupantGender = ''
          
          if (bed.allocations.length > 0) {
            const alloc = bed.allocations[0]
            occupantName = alloc.participant?.name || 'Occupied'
                    occupantGender = alloc.participant?.gender === 'MALE' ? ' [M]' : alloc.participant?.gender === 'FEMALE' ? ' [F]' : ''
            const today = new Date().toISOString().split('T')[0]
            const checkOutDateStr = typeof alloc.checkOutDate === 'string' ? alloc.checkOutDate : new Date(alloc.checkOutDate).toISOString()
            const checkout = checkOutDateStr.split('T')[0]
            
            if (today === checkout) {
              statusColor = 'bg-orange-500'
              statusLabel = 'Checkout Today'
            } else {
              statusColor = 'bg-red-500'
              statusLabel = 'Occupied'
            }
          }

          return (
            <div 
              key={bed.id} 
              className="flex flex-col items-center cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => setSelectedBed(bed)}
            >
              <div 
                className={`w-16 h-16 rounded flex items-center justify-center text-white font-bold shadow-sm ${statusColor}`}
                title={occupantName ? `${occupantName} (${statusLabel})` : statusLabel}
              >
                {bed.number}
              </div>
              <span className="text-xs text-slate-500 mt-2 truncate w-20 text-center" title={occupantName ? occupantName + occupantGender : statusLabel}>
                {occupantName ? occupantName + occupantGender : statusLabel}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bed Details Modal */}
      {selectedBed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setSelectedBed(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-1">Bed {selectedBed.number}</h3>
            
            {selectedBed.allocations?.length > 0 ? (
              <div className="mt-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="text-sm text-slate-500 font-medium mb-1">Occupant</p>
                  <p className="text-lg font-bold text-slate-800">
                      {selectedBed.allocations[0].participant?.name} 
                      {selectedBed.allocations[0].participant?.gender === 'MALE' && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Male</span>}
                      {selectedBed.allocations[0].participant?.gender === 'FEMALE' && <span className="ml-2 text-sm bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">Female</span>}
                    </p>
                  <p className="text-sm text-slate-600">{selectedBed.allocations[0].participant?.registrationNumber}</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 p-3 rounded border">
                    <p className="text-xs text-slate-500 font-medium">Check-In</p>
                    <p className="font-medium">{new Date(selectedBed.allocations[0].checkInDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded border">
                    <p className="text-xs text-slate-500 font-medium">Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>

                
                  <div className="pt-4 border-t mt-4">
                    <ShareAllocationButton 
                      participantName={selectedBed.allocations[0].participant?.name || ''}
                      hotelName={shad.name}
                      address={shad.address}
                      googleMapsLink={shad.googleMapsLink}
                      roomNo="N/A"
                      bedNo={selectedBed.number}
                    />
                  </div>
                  <div className="pt-4 mt-2 flex gap-3">
                  <button 
                    onClick={() => handleCheckOut(selectedBed.allocations[0].id)}
                    disabled={checkingOut}
                    className="flex-1 bg-orange-500 text-white py-2 rounded font-medium hover:bg-orange-600 disabled:opacity-50"
                  >
                    {checkingOut ? 'Processing...' : 'Check-Out Participant'}
                  </button>
                  <a 
                    href={`/participants/${selectedBed.allocations[0].participantId}`}
                    className="flex-1 bg-slate-200 text-slate-800 py-2 rounded font-medium hover:bg-slate-300 text-center"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200 text-center mb-4 text-sm">
                  <p className="font-medium">This bed is available. You can register someone right now.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={regData.name} 
                      onChange={e => setRegData({...regData, name: e.target.value})}
                      className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <select 
                        value={regData.gender} 
                        onChange={e => setRegData({...regData, gender: e.target.value})}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none bg-white" 
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                      <input 
                        type="text" 
                        value={regData.phone} 
                      onChange={e => setRegData({...regData, phone: e.target.value})}
                      className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reg Number (Optional)</label>
                    <input 
                      type="text" 
                      value={regData.registrationNumber} 
                      onChange={e => setRegData({...regData, registrationNumber: e.target.value})}
                      className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                    <input 
                      type="date" 
                      value={regData.checkOutDate} 
                      onChange={e => setRegData({...regData, checkOutDate: e.target.value})}
                      className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button 
                      type="submit" 
                      disabled={registering}
                      className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {registering ? 'Assigning...' : 'Register & Assign'}
                    </button>
                    <a 
                      href="/participants/new"
                      className="flex-1 bg-slate-200 text-slate-800 py-2 rounded font-medium hover:bg-slate-300 text-center text-sm flex items-center justify-center"
                    >
                      Full Form
                    </a>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
