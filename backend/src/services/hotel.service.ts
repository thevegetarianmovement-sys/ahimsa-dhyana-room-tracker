import prisma from '../lib/db'

export const getHotels = async () => {
  return await prisma.hotel.findMany({
    include: {
      rooms: {
        include: {
          beds: {
            include: {
              allocations: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: { number: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export const getHotelById = async (id: string) => {
  return await prisma.hotel.findUnique({
    where: { id },
    include: {
      rooms: {
        include: {
          beds: {
            include: {
              allocations: {
                where: { status: 'ACTIVE' },
                include: { participant: true }
              }
            }
          }
        },
        orderBy: { number: 'asc' }
      },
      volunteerShifts: { include: { volunteer: true } }
    }
  })
}

export const createHotel = async (data: { name: string, code: string, location: string, address?: string, googleMapsLink?: string }) => {
  const hotel = await prisma.hotel.create({
    data: {
      name: data.name,
      code: data.code,
      location: data.location,
      address: data.address,
      googleMapsLink: data.googleMapsLink
    }
  })
  return hotel
}

export const updateHotel = async (id: string, data: { name: string, code: string, location: string, address?: string, googleMapsLink?: string }) => {
  return await prisma.hotel.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      location: data.location,
      address: data.address,
      googleMapsLink: data.googleMapsLink
    }
  })
}

export const addRoomToHotel = async (hotelId: string, data: { number: string, capacity: number }) => {
  const parts = data.number.split(',').map((s: string) => s.trim()).filter(Boolean)
  const roomsToCreate: string[] = []

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s: string) => s.trim())
      const start = parseInt(startStr, 10)
      const end = parseInt(endStr, 10)
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          roomsToCreate.push(i.toString().padStart(startStr.length, '0'))
        }
      } else {
        roomsToCreate.push(part)
      }
    } else {
      roomsToCreate.push(part)
    }
  }

  const uniqueRooms = Array.from(new Set(roomsToCreate))

  for (const roomNum of uniqueRooms) {
    const existing = await prisma.room.findUnique({
      where: {
        hotelId_number: {
          hotelId,
          number: roomNum
        }
      }
    })
    
    if (existing) {
      throw new Error(`Room number ${roomNum} already exists in this hotel!`)
    }

    const room = await prisma.room.create({
      data: {
        hotelId,
        number: roomNum,
        capacity: data.capacity,
        gender: 'UNASSIGNED'
      }
    })

    for (let b = 1; b <= data.capacity; b++) {
      await prisma.bed.create({
        data: { roomId: room.id, number: `B${b}` }
      })
    }
  }
}


export const updateRoom = async (roomId: string, number: string) => {
  const existing = await prisma.room.findFirst({
    where: { 
      number,
      hotelId: (await prisma.room.findUnique({ where: { id: roomId } }))?.hotelId
    }
  });
  if (existing && existing.id !== roomId) {
    throw new Error('A room with this name already exists in this hotel.');
  }

  return await prisma.room.update({
    where: { id: roomId },
    data: { number }
  });
}

export const deleteRoom = async (roomId: string) => {
  return await prisma.room.delete({
    where: { id: roomId }
  })
}

export const deleteHotel = async (id: string) => {
  // Find all beds in this hotel
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { rooms: { include: { beds: true } } }
  });
  if (!hotel) throw new Error('Hotel not found');

  const bedIds = hotel.rooms.flatMap(r => r.beds.map(b => b.id));
  
  // Delete all allocations tied to these beds
  await prisma.accommodationAllocation.deleteMany({
    where: { bedId: { in: bedIds } }
  });

  // Delete all volunteer shifts tied to this hotel
  await prisma.volunteerShift.deleteMany({
    where: { hotelId: id }
  });

  // Now delete the hotel (rooms and beds cascade)
  return await prisma.hotel.delete({ where: { id } });
}
