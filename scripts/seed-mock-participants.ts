import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.participant.count()
  
  const mockParticipants = [
    { registrationNumber: `ADM-${1000 + count + 1}`, name: 'Arjun Kumar', phone: '9876543210', gender: 'MALE' },
    { registrationNumber: `ADM-${1000 + count + 2}`, name: 'Priya Sharma', phone: '9876543211', gender: 'FEMALE' },
    { registrationNumber: `ADM-${1000 + count + 3}`, name: 'Rahul Verma', phone: '9876543212', gender: 'MALE' },
    { registrationNumber: `ADM-${1000 + count + 4}`, name: 'Sneha Patel', phone: '9876543213', gender: 'FEMALE' },
    { registrationNumber: `ADM-${1000 + count + 5}`, name: 'Vikram Singh', phone: '9876543214', gender: 'MALE' },
    { registrationNumber: `ADM-${1000 + count + 6}`, name: 'Anjali Desai', phone: '9876543215', gender: 'FEMALE' },
    { registrationNumber: `ADM-${1000 + count + 7}`, name: 'Rohan Gupta', phone: '9876543216', gender: 'MALE' },
    { registrationNumber: `ADM-${1000 + count + 8}`, name: 'Kavita Reddy', phone: '9876543217', gender: 'FEMALE' },
  ]

  for (const p of mockParticipants) {
    await prisma.participant.create({
      data: p
    })
  }

  console.log('Successfully created 8 mock participants!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
