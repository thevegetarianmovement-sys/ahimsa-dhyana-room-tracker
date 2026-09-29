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
  const [regData, setRegData] = useState({ name: '', phone: '', registrationNumber: '', checkOutDate: '', checkInDate: '', gender: '' })
  const [familyMode, setFamilyMode] = useState(false);
  const [familyCart, setFamilyCart] = useState<string[]>([]);
  const [autoFamilyModal, setAutoFamilyModal] = useState(false);
  const [manualFamilyModal, setManualFamilyModal] = useState(false);
  const [familyData, setFamilyData] = useState({ name: '', phone: '', maleCount: '', femaleCount: '', checkInDate: '', checkOutDate: '', autoCount: '' });

  const handleBedClick = (bed: any) => {
    if (familyMode) {
      if (bed.allocations.length > 0) return; // Ignore occupied beds
      if (familyCart.includes(bed.id)) {
        setFamilyCart(familyCart.filter(id => id !== bed.id));
      } else {
        setFamilyCart([...familyCart, bed.id]);
      }
    } else {
      setSelectedBed({ ...bed });
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
        locationId: shadId,
        type: 'SHAD',
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


  async function handleCheckOut(allocId: string) {
    if (!confirm("Are you sure you want to check out this participant?")) return
    setCheckingOut(true)
    try {
      const res = await fetch(`/api/allocations/${allocId}/checkout`, {
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
      const res = await fetch(`/api/allocations/register`, {
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
      setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '', checkInDate: '', gender: '' })
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
              onClick={() => handleBedClick(bed)}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
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
                    className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 text-center transition-all"
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={regData.name} 
                      onChange={e => setRegData({...regData, name: e.target.value})}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                      <select 
                        value={regData.gender} 
                        onChange={e => setRegData({...regData, gender: e.target.value})}
                        className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone (Optional)</label>
                      <input 
                        type="text" 
                        value={regData.phone} 
                      onChange={e => setRegData({...regData, phone: e.target.value})}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reg Number (Optional)</label>
                    <input 
                      type="text" 
                      value={regData.registrationNumber} 
                      onChange={e => setRegData({...regData, registrationNumber: e.target.value})}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Check-In (Optional)</label>
                    <input 
                      type="date" 
                      value={regData.checkInDate || ''} 
                      onChange={e => setRegData({...regData, checkInDate: e.target.value})}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all mb-4" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Check-Out (Optional)</label>
                    <input 
                      type="date" 
                      value={regData.checkOutDate} 
                      onChange={e => setRegData({...regData, checkOutDate: e.target.value})}
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button 
                      type="submit" 
                      disabled={registering}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
                    >
                      {registering ? 'Assigning...' : 'Register & Assign'}
                    </button>
                    <a 
                      href="/participants/new"
                      className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 text-center text-sm flex items-center justify-center transition-all"
                    >
                      Full Form
                    </a>
                  </div>
                </form>
              </div>
            )}
          
        {/* Auto Family Modal */}
        {autoFamilyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setAutoFamilyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold">X</button>
              <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-purple-900">Auto-Assign Family Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Family/Main Name *</label>
                  <input type="text" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Beds Needed *</label>
                  <input type="number" min="1" value={familyData.autoCount} onChange={e => setFamilyData({...familyData, autoCount: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Males (Optional)</label>
                    <input type="number" min="0" value={familyData.maleCount} onChange={e => setFamilyData({...familyData, maleCount: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Females (Optional)</label>
                    <input type="number" min="0" value={familyData.femaleCount} onChange={e => setFamilyData({...familyData, femaleCount: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone (Optional)</label>
                    <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Check-In (Optional)</label>
                    <input type="date" value={familyData.checkInDate || ''} onChange={e => setFamilyData({...familyData, checkInDate: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Check-Out (Optional)</label>
                    <input type="date" value={familyData.checkOutDate || ''} onChange={e => setFamilyData({...familyData, checkOutDate: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                <button 
                  onClick={() => submitFamilyBooking('AUTO')}
                  disabled={registering || !familyData.name || !familyData.autoCount}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all mt-4"
                >
                  {registering ? 'Processing...' : 'Auto-Assign Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Family Modal */}
        {manualFamilyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setManualFamilyModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold">X</button>
              <h3 className="text-2xl font-extrabold tracking-tight mb-4 text-indigo-900">Book {familyCart.length} Selected Beds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Family/Main Name *</label>
                  <input type="text" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Males (Optional)</label>
                    <input type="number" min="0" value={familyData.maleCount} onChange={e => setFamilyData({...familyData, maleCount: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Number of Females (Optional)</label>
                    <input type="number" min="0" value={familyData.femaleCount} onChange={e => setFamilyData({...familyData, femaleCount: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone (Optional)</label>
                    <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Check-In (Optional)</label>
                    <input type="date" value={familyData.checkInDate || ''} onChange={e => setFamilyData({...familyData, checkInDate: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Check-Out (Optional)</label>
                    <input type="date" value={familyData.checkOutDate || ''} onChange={e => setFamilyData({...familyData, checkOutDate: e.target.value})} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                  </div>
                <button 
                  onClick={() => submitFamilyBooking('MANUAL')}
                  disabled={registering || !familyData.name}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all mt-4"
                >
                  {registering ? 'Processing...' : 'Book Selected Beds Now'}
                </button>
              </div>
            </div>
          </div>
        )}
  </div>
        </div>
      )}
    </div>
  )
}
