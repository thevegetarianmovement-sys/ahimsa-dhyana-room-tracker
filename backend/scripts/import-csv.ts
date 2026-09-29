import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

function parseCSV(file: string) {
  const content = fs.readFileSync(file, 'utf8')
  let currentPos = 0
  const rows: string[][] = []
  
  while (currentPos < content.length) {
    const row: string[] = []
    let inQuotes = false
    let currentValue = ''
    
    while (currentPos < content.length) {
      const char = content[currentPos]
      if (inQuotes) {
        if (char === '"') {
          if (currentPos + 1 < content.length && content[currentPos + 1] === '"') {
            currentValue += '"'
            currentPos++
          } else {
            inQuotes = false
          }
        } else {
          currentValue += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          row.push(currentValue)
          currentValue = ''
        } else if (char === '\n' || char === '\r') {
          row.push(currentValue)
          if (char === '\r' && currentPos + 1 < content.length && content[currentPos + 1] === '\n') {
            currentPos++
          }
          break
        } else {
          currentValue += char
        }
      }
      currentPos++
    }
    
    if (currentPos >= content.length && currentValue !== '' && row.length === 0) {
       row.push(currentValue)
    }
    if (row.length > 0) rows.push(row)
    currentPos++
  }
  
  return rows
}

async function main() {
  const rows = parseCSV('../web_hotel_update.csv')
  const dataRows = rows.slice(2).filter(r => r[0] && r[0].trim() !== '')

  for (const r of dataRows) {
    const name = r[0].trim()
    const phone = r[1] ? r[1].trim() : ''
    const contactName = r[2] ? r[2].trim() : ''
    const contactPhone = r[3] ? r[3].trim() : ''
    const beds = parseInt(r[4]) || 0
    const totalRooms = parseInt(r[5]) || 0
    const roomStr = r[9] ? r[9].trim() : ''
    const capStr = r[10] ? r[10].trim() : ''
    const inTime = r[14] ? r[14].trim() : ''
    const outTime = r[15] ? r[15].trim() : ''
    const mapsLink = r[16] ? r[16].trim() : ''
    const dist = r[17] ? r[17].trim() : ''

    // Code generation
    let code = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5)
    let uniqueCode = code
    let counter = 1
    while (await prisma.hotel.findUnique({ where: { code: uniqueCode } })) {
      uniqueCode = \`\${code}\${counter}\`
      counter++
    }

    let addressParts = []
    if (phone || contactName || contactPhone) {
        addressParts.push(\`Contact: \${phone} \${contactName ? '/ ' + contactName : ''} \${contactPhone ? '(' + contactPhone + ')' : ''}\`.trim())
    }
    if (inTime || outTime) addressParts.push(\`Timings: \${inTime} to \${outTime}\`)
    if (dist) addressParts.push(\`Distance: \${dist}m\`)

    const hotel = await prisma.hotel.create({
      data: {
        name: name,
        code: uniqueCode,
        location: dist ? \`\${dist}m away\` : null,
        address: addressParts.join(' | '),
        googleMapsLink: mapsLink || null
      }
    })

    console.log(\`Created Hotel: \${hotel.name}\`)

    // Rooms logic
    let capacity = 4
    if (capStr) {
        const match = capStr.match(/\\d+/)
        if (match) capacity = parseInt(match[0])
    } else if (totalRooms > 0 && beds > 0) {
        capacity = Math.floor(beds / totalRooms)
    }
    if (capacity === 0) capacity = 4

    let roomNumbers: string[] = []
    if (roomStr) {
        roomNumbers = roomStr.split(/[\\s,\\n\\r]+/).map(s => s.trim()).filter(s => s !== '' && s.toLowerCase() !== 'to')
        
        // Handle "1 to 25" format
        if (roomStr.toLowerCase().includes(' to ')) {
            const parts = roomStr.toLowerCase().split('to').map(s => parseInt(s.trim()))
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                roomNumbers = []
                for (let i = parts[0]; i <= parts[1]; i++) {
                    roomNumbers.push(i.toString())
                }
            }
        }
    } else {
        for (let i = 1; i <= totalRooms; i++) {
            roomNumbers.push(\`R\${i}\`)
        }
    }

    for (const num of roomNumbers) {
      const room = await prisma.room.create({
        data: {
          hotelId: hotel.id,
          number: num,
          capacity: capacity
        }
      })

      // Create beds
      const bedData = []
      for (let i = 1; i <= capacity; i++) {
        bedData.push({
          roomId: room.id,
          number: \`B\${i}\`
        })
      }
      await prisma.bed.createMany({ data: bedData })
    }
    console.log(\`  Created \${roomNumbers.length} rooms with capacity \${capacity}\`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
