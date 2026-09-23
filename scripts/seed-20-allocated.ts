import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.participant.count()

  // First fetch all available beds
  const hotels = await prisma.hotel.findMany({
    include: {
      rooms: {
        include: {
          beds: {
            include: { allocations: { where: { status: 'ACTIVE' } } }
          }
        }
      }
    }
  })

  const availableBeds: string[] = []
  hotels.forEach(h => {
    h.rooms.forEach(r => {
      r.beds.forEach(b => {
        if (b.allocations.length === 0) {
          availableBeds.push(b.id)
        }
      })
    })
  })

  if (availableBeds.length < 20) {
    console.log(`Only ${availableBeds.length} beds available, cannot assign 20 participants! Please add more rooms.`)
    return
  }

  // Create 20 participants
  for (let i = 1; i <= 20; i++) {
    const p = await prisma.participant.create({
      data: {
        registrationNumber: `ADM-MOCK-${count + i}`,
        name: `Test User ${i}`,
        gender: i % 2 === 0 ? 'FEMALE' : 'MALE'
      }
    })

    // Assign to a random available bed
    const bedIndex = Math.floor(Math.random() * availableBeds.length)
    const bedId = availableBeds[bedIndex]
    availableBeds.splice(bedIndex, 1) // remove from available

    const bed = await prisma.bed.findUnique({ where: { id: bedId }, include: { room: { include: { hotel: true } } } })
    const accId = `JADMS-${bed!.room.hotel.code}${bed!.room.number}-${Math.floor(Math.random() * 1000)}`

    await prisma.accommodationAllocation.create({
      data: {
        accommodationId: accId,
        participantId: p.id,
        bedId: bedId,
        checkInDate: new Date(),
        checkOutDate: new Date('2099-12-31T00:00:00Z'),
        status: 'ACTIVE'
      }
    })
  }

  console.log('Successfully created and allocated 20 mock participants!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
