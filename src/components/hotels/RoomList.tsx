/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import ShareAllocationButton from '../ShareAllocationButton'
import DeleteRoomButton from './DeleteRoomButton'
import { useRouter } from 'next/navigation'

export default function RoomList({ rooms, hotelId, hotel }: { rooms: any[], hotelId: string, hotel: any }) {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL') // ALL, EMPTY, PARTIAL, FULL
  const [selectedBed, setSelectedBed] = useState<any>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [regData, setRegData] = useState({ name: '', phone: '', registrationNumber: '', checkOutDate: '', checkInDate: '', gender: '' })
  
  const [groupBookingRoom, setGroupBookingRoom] = useState<any>(null)
    const [familyMode, setFamilyMode] = useState(false);
  const [familyCart, setFamilyCart] = useState<string[]>([]);
  const [autoFamilyModal, setAutoFamilyModal] = useState(false);
  const [manualFamilyModal, setManualFamilyModal] = useState(false);
  const [familyData, setFamilyData] = useState({ name: '', phone: '', maleCount: '', femaleCount: '', checkInDate: '', checkOutDate: '', autoCount: '' });
  
  const handleBedClick = (bed: any, room: any) => {
    if (familyMode) {
      if (bed.allocations.length > 0) return; // Ignore occupied beds
      if (familyCart.includes(bed.id)) {
        setFamilyCart(familyCart.filter(id => id !== bed.id));
      } else {
        setFamilyCart([...familyCart, bed.id]);
      }
    } else {
      setSelectedBed({ ...bed, roomNumber: room ? room.number : '' });
    }
  };

  const submitFamilyBooking = async (type: 'AUTO' | 'MANUAL') => {
    setRegistering(true);
    try {
      const payload = {
        data: {
          name: familyData.name,
          phone: familyData.phone,
          maleCount: familyData.maleCount ? parseInt(familyData.maleCount) : 0,
            femaleCount: familyData.femaleCount ? parseInt(familyData.femaleCount) : 0,
            checkInDate: familyData.checkInDate,
            checkOutDate: familyData.checkOutDate
          },
        locationId: hotelId,
        type: 'HOTEL',
        bookingParams: {
          autoCount: type === 'AUTO' ? parseInt(familyData.autoCount) : undefined,
          bedIds: type === 'MANUAL' ? familyCart : undefined
        }
      };

      const res = await fetch(`/api/allocations/family-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error booking family');
      }
      setAutoFamilyModal(false);
      setManualFamilyModal(false);
      setFamilyMode(false);
      setFamilyCart([]);
      setFamilyData({ name: '', phone: '', maleCount: '', femaleCount: '', checkInDate: '', checkOutDate: '', autoCount: '' });
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setRegistering(false);
    }
  };

  const [groupData, setGroupData] = useState<{name: string, phone: string, registrationNumber: string, checkInDate: string, checkOutDate: string, gender: string}[]>([])

  async function handleCheckOut(allocId: string) {
    if (!confirm("Are you sure you want to check out this participant?")) return
    setCheckingOut(true)
    try {
      const res = await fetch(`/api/allocations/${allocId}/checkout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locationId: hotelId })
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
      const res = await fetch(`/api/allocations/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: regData, locationId: hotelId, bedId: selectedBed.id, type: 'HOTEL' })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error registering');
      }
      setSelectedBed(null)
      setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '', checkInDate: '', gender: '' })
      router.refresh();
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Error registering and allocating")
    }
    setRegistering(false)
  }

  async function handleGroupRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegistering(true)
    try {
      const res = await fetch(`/api/allocations/group-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ people: groupData, locationId: hotelId, roomId: groupBookingRoom.id })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error group registering');
      }
      setGroupBookingRoom(null)
      setGroupData([])
      router.refresh();
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Error assigning group")
    }
    setRegistering(false)
  }

  function openGroupBooking(room: any) {
    const available = room.beds.filter((b: any) => b.allocations.length === 0).length
    if (available === 0) return alert('This room is full.')
    
    // Initialize empty array for available beds
    setGroupData(Array(available).fill(null).map(() => ({ name: '', phone: '', registrationNumber: '', checkOutDate: '', checkInDate: '', gender: '' })))
    setGroupBookingRoom(room)
  }

  const filteredRooms = rooms.filter(room => {
    const roomOccupiedBeds = room.beds.filter((b: any) => b.allocations.length > 0).length
    
    if (filter === 'ALL') return true
    if (filter === 'EMPTY') return roomOccupiedBeds === 0
    if (filter === 'FULL') return roomOccupiedBeds === room.capacity
    if (filter === 'PARTIAL') return roomOccupiedBeds > 0 && roomOccupiedBeds < room.capacity
    return true
  })

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-700">Rooms</h2>
        <div className="bg-slate-200 p-1 rounded-lg flex space-x-1">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('EMPTY')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'EMPTY' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Empty
          </button>
          <button 
            onClick={() => setFilter('PARTIAL')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'PARTIAL' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Partially Occupied
          </button>
          <button 
            onClick={() => setFilter('FULL')}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${filter === 'FULL' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Full
          </button>
        </div>
      </div>
      
      
      {/* Family Booking Controls */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="w-full flex justify-between items-center mb-2">
          <h3 className="font-bold text-purple-900">Family Booking</h3>
          {familyMode && (
            <button onClick={() => { setFamilyMode(false); setFamilyCart([]); }} className="text-sm text-purple-700 underline">Cancel Manual Mode</button>
          )}
        </div>
        
        {!familyMode ? (
          <>
            <button 
              onClick={() => setAutoFamilyModal(true)}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 text-sm font-bold"
            >
              Auto-Assign Family
            </button>
            <button 
              onClick={() => { setFamilyMode(true); setFamilyCart([]); }}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm font-bold"
            >
              Manual Select Family
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="font-medium text-purple-800">{familyCart.length} beds selected</span>
            <button 
              onClick={() => setManualFamilyModal(true)}
              disabled={familyCart.length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold disabled:opacity-50"
            >
              Book Selected Beds
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filteredRooms.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white border rounded-lg border-dashed">
            No rooms match this filter.
          </div>
        )}
        {filteredRooms.map(room => {
          const roomOccupiedBeds = room.beds.filter((b: any) => b.allocations.length > 0).length
          const canDelete = roomOccupiedBeds === 0

          return (
            <div key={room.id} className="bg-white border rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-bold">Room {room.number}</h3>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                    {room.capacity} Beds
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openGroupBooking(room)}
                    disabled={roomOccupiedBeds === room.capacity}
                    className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    👥 Group Booking
                  </button>
                  <DeleteRoomButton roomId={room.id} hotelId={hotelId} disabled={!canDelete} />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                {room.beds.map((bed: any) => {
                  let statusColor = 'bg-green-500' // Available
                  let statusLabel = 'Available'
                  let occupantName = ''
                  
                  let occupantGender = ''
                  
                  if (bed.allocations.length > 0) {
                    const alloc = bed.allocations[0]
                    occupantName = alloc.participant?.name || 'Occupied'
                    occupantGender = alloc.participant?.gender === 'MALE' ? ' [M]' : alloc.participant?.gender === 'FEMALE' ? ' [F]' : ''
                    const today = new Date().toISOString().split('T')[0]
                    // We parse manually just in case checkOutDate is string from API
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
                      onClick={() => handleBedClick(bed, room)}
                    >
                      <div 
                        className={`w-12 h-12 rounded flex items-center justify-center text-white font-bold shadow-sm ${statusColor} ${familyCart.includes(bed.id) ? 'ring-4 ring-purple-600 ring-offset-2' : ''}`}
                        title={occupantName ? `${occupantName} (${statusLabel})` : statusLabel}
                      >
                        {bed.number}
                      </div>
                      <span className="text-xs text-slate-500 mt-1 truncate w-16 text-center" title={occupantName ? occupantName + occupantGender : statusLabel}>
                        {occupantName ? occupantName + occupantGender : statusLabel}
                      </span>
                    </div>
                  )
                })}
              
        {/* Auto Family Modal */}
        {autoFamilyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setAutoFamilyModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h3 className="text-xl font-bold mb-4 text-purple-900">Auto-Assign Family Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Family/Main Name *</label>
                  <input type="text" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Beds Needed *</label>
                  <input type="number" min="1" value={familyData.autoCount} onChange={e => setFamilyData({...familyData, autoCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Number of Males (Optional)</label>
                    <input type="number" min="0" value={familyData.maleCount} onChange={e => setFamilyData({...familyData, maleCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Females (Optional)</label>
                    <input type="number" min="0" value={familyData.femaleCount} onChange={e => setFamilyData({...familyData, femaleCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white" />
                  </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                    <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                    <input type="date" value={familyData.checkInDate || ''} onChange={e => setFamilyData({...familyData, checkInDate: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                    <input type="date" value={familyData.checkOutDate || ''} onChange={e => setFamilyData({...familyData, checkOutDate: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                <button 
                  onClick={() => submitFamilyBooking('AUTO')}
                  disabled={registering || !familyData.name || !familyData.autoCount}
                  className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 disabled:opacity-50 mt-2"
                >
                  {registering ? 'Processing...' : 'Auto-Assign Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Family Modal */}
        {manualFamilyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setManualFamilyModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h3 className="text-xl font-bold mb-4 text-indigo-900">Book {familyCart.length} Selected Beds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Family/Main Name *</label>
                  <input type="text" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Number of Males (Optional)</label>
                    <input type="number" min="0" value={familyData.maleCount} onChange={e => setFamilyData({...familyData, maleCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Females (Optional)</label>
                    <input type="number" min="0" value={familyData.femaleCount} onChange={e => setFamilyData({...familyData, femaleCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white" />
                  </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                    <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                    <input type="date" value={familyData.checkInDate || ''} onChange={e => setFamilyData({...familyData, checkInDate: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                    <input type="date" value={familyData.checkOutDate || ''} onChange={e => setFamilyData({...familyData, checkOutDate: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                <button 
                  onClick={() => submitFamilyBooking('MANUAL')}
                  disabled={registering || !familyData.name}
                  className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50 mt-2"
                >
                  {registering ? 'Processing...' : 'Book Selected Beds Now'}
                </button>
              </div>
            </div>
          </div>
        )}
  </div>
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
            <h3 className="text-2xl font-bold mb-1">Room {selectedBed.roomNumber} - {selectedBed.number}</h3>
            
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
                      hotelName={hotel.name}
                      address={hotel.address}
                      googleMapsLink={hotel.googleMapsLink}
                      roomNo={selectedBed.roomNumber}
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
                    <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                    <input 
                      type="date" 
                      value={regData.checkInDate || ''} 
                      onChange={e => setRegData({...regData, checkInDate: e.target.value})}
                      className="w-full border px-3 py-2 rounded focus:ring focus:outline-none mb-4" 
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

      {/* Group Booking Modal */}
      {groupBookingRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setGroupBookingRoom(null); setGroupData([]); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-1">Group Booking: Room {groupBookingRoom.number}</h3>
            <p className="text-slate-500 mb-6">Assign multiple people to the {groupData.length} available beds.</p>
            
            <form onSubmit={handleGroupRegister} className="space-y-6">
              {groupData.map((data, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700">Bed {idx + 1}</h4>
                      {idx === 0 && groupData.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const nd = [...groupData];
                            const first = nd[0];
                            for(let i=1; i<nd.length; i++) {
                              nd[i] = { ...first, name: first.name ? first.name + (i > 0 ? ' (Guest ' + i + ')' : '') : '' };
                            }
                            setGroupData(nd);
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200 transition-colors"
                        >
                          Copy details to all beds
                        </button>
                      )}
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input 
                        type="text" 
                        value={data.name} 
                        onChange={e => {
                          const nd = [...groupData]; 
                          nd[idx].name = e.target.value; 
                          setGroupData(nd);
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                      />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select 
                          value={data.gender} 
                          onChange={e => {
                            const nd = [...groupData]; 
                            nd[idx].gender = e.target.value; 
                            setGroupData(nd);
                          }}
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
                          value={data.phone} 
                        onChange={e => {
                          const nd = [...groupData]; 
                          nd[idx].phone = e.target.value; 
                          setGroupData(nd);
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                      <input 
                        type="date" 
                        value={data.checkInDate || ''} 
                        onChange={(e) => {
                          const nd = [...groupData];
                          nd[idx].checkInDate = e.target.value;
                          setGroupData(nd);
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none mb-4" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                      <input 
                        type="date" 
                        value={data.checkOutDate} 
                        onChange={e => {
                          const nd = [...groupData]; 
                          nd[idx].checkOutDate = e.target.value; 
                          setGroupData(nd);
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => { setGroupBookingRoom(null); setGroupData([]); }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={registering}
                  className="bg-emerald-600 text-white px-6 py-2 rounded shadow hover:bg-emerald-700 disabled:opacity-50 font-medium"
                >
                  {registering ? 'Assigning Group...' : 'Assign Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
