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

export const createHotel = async (data: { name: string, code: string, location: string }) => {
  const hotel = await prisma.hotel.create({
    data: {
      name: data.name,
      code: data.code,
      location: data.location,
    }
  })
  return hotel
}

export const updateHotel = async (id: string, data: { name: string, code: string, location: string }) => {
  return await prisma.hotel.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      location: data.location
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

export const deleteRoom = async (roomId: string) => {
  return await prisma.room.delete({
    where: { id: roomId }
  })
}
