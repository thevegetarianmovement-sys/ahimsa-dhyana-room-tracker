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
  data: { name: string, registrationNumber?: string, phone?: string, checkInDate?: string, checkOutDate?: string, gender?: string },
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
  const inDate = data.checkInDate ? new Date(data.checkInDate) : new Date()
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
  people: { name: string, registrationNumber?: string, phone?: string, checkInDate?: string, checkOutDate?: string, gender?: string }[],
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

    const inDate = data.checkInDate ? new Date(data.checkInDate) : new Date()
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

export const familyBookAndAllocate = async (
  data: { name: string, phone?: string, maleCount?: number, femaleCount?: number, checkInDate?: string, checkOutDate?: string },

  locationId: string,
  type: 'HOTEL' | 'SHAD',
  bookingParams: { autoCount?: number, bedIds?: string[] }
) => {
  let targetBedIds: string[] = [];

  if (bookingParams.bedIds && bookingParams.bedIds.length > 0) {
    // MANUAL SELECT
    targetBedIds = bookingParams.bedIds;
    
    // Verify they are actually empty
    for (const bId of targetBedIds) {
      let existing = null;
      if (type === 'HOTEL') {
        existing = await prisma.accommodationAllocation.findFirst({ where: { bedId: bId, status: 'ACTIVE' } });
      } else {
        existing = await prisma.accommodationAllocation.findFirst({ where: { shadBedId: bId, status: 'ACTIVE' } });
      }
      if (existing) {
        throw new Error('One or more selected beds were just booked by someone else.');
      }
    }
  } else if (bookingParams.autoCount && bookingParams.autoCount > 0) {
    // AUTO ASSIGN
    if (type === 'HOTEL') {
      const rooms = await prisma.room.findMany({
        where: { hotelId: locationId },
        include: {
          beds: {
            include: { allocations: { where: { status: 'ACTIVE' } } }
          }
        },
        orderBy: { number: 'asc' }
      });
      
      const emptyBeds = [];
      for (const r of rooms) {
        // Sort beds numerically in room
        const sortedBeds = r.beds.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
        for (const b of sortedBeds) {
          if (b.allocations.length === 0) {
            emptyBeds.push(b.id);
          }
        }
      }
      
      if (emptyBeds.length < bookingParams.autoCount) {
        throw new Error(`Not enough available beds. Need ${bookingParams.autoCount}, but only ${emptyBeds.length} available.`);
      }
      targetBedIds = emptyBeds.slice(0, bookingParams.autoCount);
    } else {
      // SHAD
      const shadBeds = await prisma.shadBed.findMany({
        where: { shadId: locationId },
        include: { allocations: { where: { status: 'ACTIVE' } } }
      });
      
      const emptyBeds = shadBeds
        .filter(b => b.allocations.length === 0)
        .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
        .map(b => b.id);
        
      if (emptyBeds.length < bookingParams.autoCount) {
        throw new Error(`Not enough available beds. Need ${bookingParams.autoCount}, but only ${emptyBeds.length} available.`);
      }
      targetBedIds = emptyBeds.slice(0, bookingParams.autoCount);
    }
  } else {
    throw new Error('Must provide either autoCount or bedIds');
  }

  
  const inDate = data.checkInDate ? new Date(data.checkInDate) : new Date();
  let outDate = new Date('2099-12-31T00:00:00Z');
  if (data.checkOutDate) {
    outDate = new Date(data.checkOutDate);
  }

  let maleRemaining = data.maleCount || 0;
  let femaleRemaining = data.femaleCount || 0;
// Create separate participants and allocations for each bed in the family
  const allocations = [];
  const startCount = await prisma.participant.count();
  
  for (let i = 0; i < targetBedIds.length; i++) {
    const bId = targetBedIds[i];
    const regNum = `FAM-${1000 + startCount + 1 + i}`;
    
    let pGender = null;
    if (maleRemaining > 0) {
      pGender = 'MALE';
      maleRemaining--;
    } else if (femaleRemaining > 0) {
      pGender = 'FEMALE';
      femaleRemaining--;
    }

    const p = await prisma.participant.create({
      data: {
        registrationNumber: regNum,
        name: data.name.trim() + (targetBedIds.length > 1 ? ` (${i + 1})` : ''),
        phone: data.phone || null,
        gender: pGender,
      }
    });

    const alloc = await prisma.accommodationAllocation.create({
      data: {
        accommodationId: `FAM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        participantId: p.id,
        bedId: type === 'HOTEL' ? bId : null,
        shadBedId: type === 'SHAD' ? bId : null,
        checkInDate: inDate,
        checkOutDate: outDate,
        status: 'ACTIVE'
      }
    });
    allocations.push(alloc);
  }

  return allocations;
}

export const bulkUndoAllocations = async (allocationIds: string[]) => {
  // Hard delete allocations
  await prisma.accommodationAllocation.deleteMany({
    where: { id: { in: allocationIds } }
  });
  return { success: true, count: allocationIds.length };
};
