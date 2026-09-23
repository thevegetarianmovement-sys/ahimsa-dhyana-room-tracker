import prisma from '../lib/db'

export const getShads = async () => {
  return await prisma.shad.findMany({
    include: {
      beds: {
        include: {
          allocations: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export const getShadById = async (id: string) => {
  return await prisma.shad.findUnique({
    where: { id },
    include: {
      beds: {
        include: {
          allocations: {
            where: { status: 'ACTIVE' },
            include: { participant: true }
          }
        }
      },
      volunteerShifts: { include: { volunteer: true } }
    }
  })
}

export const createShad = async (data: { name: string, code: string, capacity: number }) => {
  const shad = await prisma.shad.create({
    data: {
      name: data.name,
      code: data.code,
      capacity: data.capacity
    }
  })

  for (let b = 1; b <= data.capacity; b++) {
    await prisma.shadBed.create({
      data: { shadId: shad.id, number: `S${b.toString().padStart(3, '0')}` }
    })
  }

  return shad
}

export const updateShad = async (id: string, data: { name: string, code: string, capacity: number }) => {
  const shad = await prisma.shad.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      capacity: data.capacity
    },
    include: {
      beds: true
    }
  })

  const currentBedCount = shad.beds.length
  if (data.capacity > currentBedCount) {
    for (let b = currentBedCount + 1; b <= data.capacity; b++) {
      await prisma.shadBed.create({
        data: { shadId: shad.id, number: `S${b.toString().padStart(3, '0')}` }
      })
    }
  }

  return shad
}
