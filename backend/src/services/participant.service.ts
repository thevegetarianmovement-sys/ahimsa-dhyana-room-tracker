import prisma from '../lib/db'

export type ParticipantData = {
  name: string
  registrationNumber?: string
  phone?: string
  gender?: string
  categoryId?: string
}

export const getParticipants = async (q: string, statusFilter?: string) => {
  let whereClause: any = {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { registrationNumber: { contains: q, mode: 'insensitive' } },
      { allocations: { some: { accommodationId: { contains: q, mode: 'insensitive' } } } }
    ]
  }

  if (statusFilter === 'UNASSIGNED') {
    whereClause.allocations = { none: {} }
  } else if (statusFilter === 'ACTIVE' || statusFilter === 'CHECKED_OUT') {
    whereClause.allocations = { some: { status: statusFilter } }
  }

  return await prisma.participant.findMany({
    where: whereClause,
    include: {
      category: true,
      allocations: {
        include: {
          bed: { include: { room: { include: { hotel: true } } } },
          shadBed: { include: { shad: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const getParticipantById = async (id: string) => {
  return await prisma.participant.findUnique({
    where: { id },
    include: {
      category: true,
      allocations: {
        include: {
          bed: { include: { room: { include: { hotel: true } } } },
          shadBed: { include: { shad: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}

export const getCategories = async () => {
  return await prisma.participantCategory.findMany({
    orderBy: { name: 'asc' }
  })
}

export const createParticipant = async (data: ParticipantData) => {
  let regNum = data.registrationNumber
  if (!regNum || regNum.trim() === '') {
    const count = await prisma.participant.count()
    regNum = `ADM-${1000 + count + 1}`
  }

  return await prisma.participant.create({
    data: {
      registrationNumber: regNum,
      name: data.name,
      phone: data.phone || null,
      gender: data.gender || null,
      categoryId: data.categoryId || null,
    }
  })
}

export const updateParticipant = async (id: string, data: ParticipantData) => {
  let regNum = data.registrationNumber
  if (!regNum || regNum.trim() === '') {
    const existing = await prisma.participant.findUnique({ where: { id } })
    regNum = existing?.registrationNumber || `ADM-${1000 + (await prisma.participant.count())}`
  }

  return await prisma.participant.update({
    where: { id },
    data: {
      registrationNumber: regNum,
      name: data.name,
      phone: data.phone || null,
      gender: data.gender || null,
      categoryId: data.categoryId || null,
    }
  })
}

export const bulkCreateParticipants = async (participants: { name: string, phone?: string, registrationNumber?: string }[]) => {
  let successCount = 0
  let skipCount = 0

  for (const p of participants) {
    if (!p.name || p.name.trim() === '') {
      skipCount++
      continue
    }

    let regNum = p.registrationNumber
    if (regNum) {
      const existing = await prisma.participant.findUnique({ where: { registrationNumber: regNum } })
      if (existing) {
        skipCount++
        continue
      }
    } else {
      const count = await prisma.participant.count()
      regNum = `ADM-${1000 + count + 1 + successCount}`
    }

    await prisma.participant.create({
      data: {
        name: p.name,
        phone: p.phone || null,
        registrationNumber: regNum
      }
    })
    successCount++
  }

  return { successCount, skipCount }
}
