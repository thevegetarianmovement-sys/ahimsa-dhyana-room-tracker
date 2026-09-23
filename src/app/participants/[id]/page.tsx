/* eslint-disable @typescript-eslint/no-explicit-any */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import ParticipantForm from '@/components/participants/ParticipantForm'
import AllocationForm from '@/components/participants/AllocationForm'
import CancelAllocationButton from '@/components/participants/CancelAllocationButton'

export default async function ParticipantDetailsPage({ params }: { params: { id: string } }) {
  const sessionCookie = cookies().get('session')?.value || ''
  
  const [participantRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants/${params.id}`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants/categories`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' })
  ])

  if (!participantRes.ok) {
    notFound()
  }

  const participantData = await participantRes.json()
  const categories = await categoriesRes.json()

  // Parse dates from JSON
  const participant = {
    ...participantData,
    createdAt: new Date(participantData.createdAt),
    updatedAt: new Date(participantData.updatedAt),
    allocations: participantData.allocations.map((a: any) => ({
      ...a,
      checkInDate: new Date(a.checkInDate),
      checkOutDate: new Date(a.checkOutDate),
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
    }))
  }
  const [hotelsRes, shadsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/hotels`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/shads`, { headers: { Cookie: `session=${sessionCookie}` }, cache: 'no-store' })
  ])
  const hotels = await hotelsRes.json()
  const shads = await shadsRes.json()

  const activeAllocation = participant.allocations.find((a: any) => a.status === 'ACTIVE')

  // Natural sort for hotel beds
  hotels.forEach((h: any) => {
    h.rooms.forEach((r: any) => {
      r.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
    })
    // Sort rooms naturally too!
    h.rooms.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
  })

  // Natural sort for shad beds
  shads.forEach((s: any) => {
    s.beds.sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }))
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/participants" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Participants</Link>
        <h1 className="text-3xl font-bold text-slate-800">Participant Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <ParticipantForm initialData={participant} categories={categories} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Current Accommodation</h2>
          {activeAllocation ? (
            <div className="bg-white p-6 rounded-lg shadow border border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-500">Accommodation ID</p>
                  <p className="text-2xl font-bold text-slate-900">{activeAllocation.accommodationId}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500">Check In</p>
                  <p className="font-medium">{new Date(activeAllocation.checkInDate).toISOString().split('T')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Check Out</p>
                  <p className="font-medium">{new Date(activeAllocation.checkOutDate).toISOString().split('T')[0]}</p>
                </div>
              </div>

              {activeAllocation.bed && (
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-medium">Hotel: {activeAllocation.bed.room.hotel.name}</p>
                  <p className="text-slate-600">Location: {activeAllocation.bed.room.hotel.location}</p>
                  <p className="text-slate-600">Room: {activeAllocation.bed.room.number}</p>
                  <p className="text-slate-600">Bed: {activeAllocation.bed.number}</p>
                </div>
              )}

              {activeAllocation.shadBed && (
                <div className="bg-slate-50 p-4 rounded border">
                  <p className="font-medium">Shad: {activeAllocation.shadBed.shad.name}</p>
                  <p className="text-slate-600">Bed: {activeAllocation.shadBed.number}</p>
                </div>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {(() => {
                  let message = `*Accommodation Confirmed*\n\nName: ${participant.name}\n`
                  if (participant.registrationNumber) message += `Reg No: ${participant.registrationNumber}\n`
                  
                  if (activeAllocation.bed) {
                    message += `\n*Location:* ${activeAllocation.bed.room.hotel.name}\n*Address:* ${activeAllocation.bed.room.hotel.location}\n*Room:* ${activeAllocation.bed.room.number}\n*Bed:* ${activeAllocation.bed.number}`
                  } else if (activeAllocation.shadBed) {
                    message += `\n*Location:* ${activeAllocation.shadBed.shad.name}\n*Bed:* ${activeAllocation.shadBed.number}`
                  }
                  
                  message += `\n\nPlease show this message at the reception.`
                  
                  const encodedMessage = encodeURIComponent(message)
                  const phoneParam = participant.phone ? participant.phone.replace(/\D/g, '') : ''
                  
                  return (
                    <a 
                      href={`https://wa.me/${phoneParam}?text=${encodedMessage}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 flex-1 text-center shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
                      Share via WhatsApp
                    </a>
                  )
                })()}
                <div className="flex-1">
                  <CancelAllocationButton 
                    allocationId={activeAllocation.id} 
                    participantId={participant.id} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <AllocationForm participantId={participant.id} hotels={hotels} shads={shads} />
          )}

          {participant.allocations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Allocation History</h3>
              <div className="space-y-3">
                {participant.allocations.map((alloc: any) => (
                  <div key={alloc.id} className="text-sm bg-slate-50 p-3 rounded border flex justify-between">
                    <div>
                      <span className="font-medium">{alloc.accommodationId}</span>
                      <p className="text-slate-500">
                        {new Date(activeAllocation.checkInDate).toISOString().split('T')[0]} to {new Date(activeAllocation.checkOutDate).toISOString().split('T')[0]}
                      </p>
                    </div>
                    <span className="text-slate-500">{alloc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
