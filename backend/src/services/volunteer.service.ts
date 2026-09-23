import prisma from '../lib/db'

export const getVolunteers = async () => {
  return await prisma.volunteer.findMany({
    include: {
      shifts: {
        include: { hotel: true, shad: true },
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export const getVolunteerById = async (id: string) => {
  return await prisma.volunteer.findUnique({
    where: { id },
    include: {
      shifts: {
        include: { hotel: true, shad: true },
        orderBy: { date: 'asc' }
      }
    }
  })
}

export const createVolunteer = async (data: { name: string, phone?: string, isActive: boolean }) => {
  return await prisma.volunteer.create({ data })
}

export const updateVolunteer = async (id: string, data: { name: string, phone?: string, isActive: boolean }) => {
  return await prisma.volunteer.update({ where: { id }, data })
}

export const assignShift = async (volunteerId: string, data: any) => {
  return await prisma.volunteerShift.create({
    data: {
      volunteerId,
      hotelId: data.locationType === 'HOTEL' ? data.locationId : null,
      shadId: data.locationType === 'SHAD' ? data.locationId : null,
      date: new Date(data.date),
      shiftName: data.shiftName,
      startTime: data.startTime,
      endTime: data.endTime
    }
  })
}

export const deleteShift = async (shiftId: string) => {
  return await prisma.volunteerShift.delete({
    where: { id: shiftId }
  })
}

export const getOnDutyShifts = async (locationId: string, type: 'HOTEL' | 'SHAD') => {
  const today = new Date()
  today.setHours(0,0,0,0)
  return await prisma.volunteerShift.findMany({
    where: {
      [type === 'HOTEL' ? 'hotelId' : 'shadId']: locationId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: { volunteer: true }
  })
}
