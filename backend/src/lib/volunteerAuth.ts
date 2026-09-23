import prisma from '../lib/db'

export const isVolunteerAuthorizedForLocation = async (volunteerId: string, locationId: string, locationType: 'HOTEL' | 'SHAD'): Promise<boolean> => {
  // Find volunteer
  const vol = await prisma.volunteer.findUnique({
    where: { id: volunteerId },
    include: { shifts: true }
  })

  if (!vol || !vol.isActive) return false

  const now = new Date()

  for (const shift of vol.shifts) {
    if (locationType === 'HOTEL' && shift.hotelId !== locationId) continue
    if (locationType === 'SHAD' && shift.shadId !== locationId) continue

    const baseDateString = shift.date.toISOString().split('T')[0]
    const startDateTime = new Date(`${baseDateString}T${shift.startTime}:00`)
    
    let endDateTime = new Date(`${baseDateString}T${shift.endTime}:00`)
    
    if (shift.endTime < shift.startTime) {
      endDateTime.setDate(endDateTime.getDate() + 1)
    }

    if (now >= startDateTime && now <= endDateTime) {
      return true
    }
  }

  return false
}
