import prisma from '../lib/db'

// JADMS Algorithm
const generateJadmsId = async (type: string, bedId: string | null, shadBedId: string | null): Promise<string> => {
  let accId = `JADMS-${Date.now()}` // Fallback
  
  if (type === 'HOTEL' && bedId) {
    const bed = await prisma.bed.findUnique({ 
      where: { id: bedId }, 
      include: { room: { include: { hotel: true } } } 
    })
    if (bed) {
      const serial = Math.floor(Math.random() * 1000)
      accId = `JADMS-${bed.room.hotel.code}${bed.room.number}-${serial}`
    }
  } else if (type === 'SHAD' && shadBedId) {
    const shadBed = await prisma.shadBed.findUnique({ 
      where: { id: shadBedId }, 
      include: { shad: true } 
    })
    if (shadBed) {
      const serial = Math.floor(Math.random() * 1000)
      accId = `JADMS-${shadBed.shad.code}-${serial}`
    }
  }
  
  return accId
}

export const allocateAccommodation = async (participantId: string, data: { type: string, bedId?: string | null, shadBedId?: string | null, checkInDate: string, checkOutDate: string }) => {
  const { type, bedId, shadBedId, checkInDate, checkOutDate } = data
  
  const inDate = new Date(checkInDate)
  const outDate = new Date(checkOutDate)

  // Validate relationships
  if (type === 'HOTEL' && bedId) {
    const bed = await prisma.bed.findUnique({ where: { id: bedId } })
    if (!bed) throw new Error('Bed not found')
  } else if (type === 'SHAD' && shadBedId) {
    const shadBed = await prisma.shadBed.findUnique({ where: { id: shadBedId } })
    if (!shadBed) throw new Error('Shad bed not found')
  }

  // Double booking check logic exactly as original
  let existing = null
  if (type === 'HOTEL' && bedId) {
    existing = await prisma.accommodationAllocation.findFirst({
      where: {
        bedId,
        status: 'ACTIVE',
        OR: [
          { checkInDate: { lte: outDate }, checkOutDate: { gte: inDate } }
        ]
      }
    })
  } else if (type === 'SHAD' && shadBedId) {
    existing = await prisma.accommodationAllocation.findFirst({
      where: {
        shadBedId,
        status: 'ACTIVE',
        OR: [
          { checkInDate: { lte: outDate }, checkOutDate: { gte: inDate } }
        ]
      }
    })
  }

  if (existing) {
    throw new Error('This bed is already booked for the selected dates.')
  }

  const accId = await generateJadmsId(type, bedId || null, shadBedId || null)

  const alloc = await prisma.accommodationAllocation.create({
    data: {
      accommodationId: accId,
      participantId,
      bedId: type === 'HOTEL' ? bedId : null,
      shadBedId: type === 'SHAD' ? shadBedId : null,
      checkInDate: inDate,
      checkOutDate: outDate,
      status: 'ACTIVE'
    }
  })

  return alloc
}

export const cancelAllocation = async (allocationId: string) => {
  return await prisma.accommodationAllocation.update({
    where: { id: allocationId },
    data: { status: 'CANCELLED' }
  })
}

export const checkOutAllocation = async (allocationId: string) => {
  return await prisma.accommodationAllocation.update({
    where: { id: allocationId },
    data: { 
      status: 'CHECKED_OUT',
      checkOutDate: new Date()
    }
  })
}

export const registerAndAllocate = async (
  data: { name: string, registrationNumber?: string, phone?: string, checkOutDate?: string },
  locationId: string,
  bedId: string,
  type: 'HOTEL' | 'SHAD'
) => {
  // 1. Check double booking first
  let existing = null
  if (type === 'HOTEL') {
    existing = await prisma.accommodationAllocation.findFirst({ where: { bedId, status: 'ACTIVE' } })
  } else {
    existing = await prisma.accommodationAllocation.findFirst({ where: { shadBedId: bedId, status: 'ACTIVE' } })
  }
  if (existing) throw new Error('This bed was just booked by someone else.')

  // 2. Create Participant
  let regNum = data.registrationNumber
  if (!regNum || regNum.trim() === '') {
    const count = await prisma.participant.count()
    regNum = `ADM-${1000 + count + 1}`
  }

  const p = await prisma.participant.create({
    data: {
      registrationNumber: regNum,
      name: data.name,
      phone: data.phone || null,
    }
  })

  // 3. Allocate Accommodation
  const inDate = new Date()
  let outDate = new Date('2099-12-31T00:00:00Z')
  if (data.checkOutDate) {
    outDate = new Date(data.checkOutDate)
  }

  let accId = `JADMS-${Date.now()}`
  if (type === 'HOTEL') {
    const bed = await prisma.bed.findUnique({ where: { id: bedId }, include: { room: { include: { hotel: true } } } })
    if (bed) accId = `JADMS-${bed.room.hotel.code}${bed.room.number}-${Math.floor(Math.random() * 1000)}`
  } else {
    const shadBed = await prisma.shadBed.findUnique({ where: { id: bedId }, include: { shad: true } })
    if (shadBed) accId = `JADMS-${shadBed.shad.code}-${Math.floor(Math.random() * 1000)}`
  }

  const alloc = await prisma.accommodationAllocation.create({
    data: {
      accommodationId: accId,
      participantId: p.id,
      bedId: type === 'HOTEL' ? bedId : null,
      shadBedId: type === 'SHAD' ? bedId : null,
      checkInDate: inDate,
      checkOutDate: outDate,
      status: 'ACTIVE'
    }
  })

  return alloc
}

export const groupRegisterAndAllocate = async (
  people: { name: string, registrationNumber?: string, phone?: string, checkOutDate?: string }[],
  locationId: string,
  roomId: string
) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      beds: {
        include: {
          allocations: { where: { status: 'ACTIVE' } }
        }
      }
    }
  })
  
  if (!room) throw new Error('Room not found')

  const availableBeds = room.beds
    .filter((b: any) => b.allocations.length === 0)
    .sort((a: any, b: any) => a.number.localeCompare(b.number, undefined, { numeric: true }))

  const validPeople = people.filter(p => p.name && p.name.trim() !== '')

  if (availableBeds.length < validPeople.length) {
    throw new Error(`Not enough available beds in this room. Need ${validPeople.length}, but only ${availableBeds.length} are available.`)
  }

  const allocations = []
  
  // Actually, wait, original groupRegisterAndAllocate didn't wrap this in a transaction. We'll do it sequentially exactly as original.
  for (let i = 0; i < validPeople.length; i++) {
    const data = validPeople[i]
    const bed = availableBeds[i]

    let regNum = data.registrationNumber
    if (!regNum || regNum.trim() === '') {
      const count = await prisma.participant.count()
      regNum = `ADM-${1000 + count + 1 + i}`
    }

    const p = await prisma.participant.create({
      data: {
        registrationNumber: regNum,
        name: data.name.trim(),
        phone: data.phone || null,
      }
    })

    const inDate = new Date()
    let outDate = new Date('2099-12-31T00:00:00Z')
    if (data.checkOutDate) {
      outDate = new Date(data.checkOutDate)
    }

    const alloc = await prisma.accommodationAllocation.create({
      data: {
        accommodationId: `JADMS-${Date.now()}-${i}`,
        participantId: p.id,
        bedId: bed.id,
        checkInDate: inDate,
        checkOutDate: outDate,
        status: 'ACTIVE'
      }
    })
    allocations.push(alloc)
  }
  
  return allocations
}
