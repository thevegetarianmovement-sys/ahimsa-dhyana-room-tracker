const fs = require('fs');

async function main() {
  const content = fs.readFileSync('../web_hotel_update.csv', 'utf8')
  let currentPos = 0
  const rows = []
  
  while (currentPos < content.length) {
    const row = []
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
  
  const dataRows = rows.slice(2).filter(r => r[0] && r[0].trim() !== '')

  const apiUrl = 'https://ahimsa-dhyana-room-tracker-production.up.railway.app'
  const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Ahimsa@#admin' })
  })
  
  const setCookie = loginRes.headers.get('set-cookie')
  const sessionToken = setCookie ? setCookie.split(';')[0] : ''
  console.log('Logged in successfully.')

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i]
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

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    let addressParts = []
    if (phone || contactName || contactPhone) {
        addressParts.push(('Contact: ' + phone + ' ' + (contactName ? '/ ' + contactName : '') + ' ' + (contactPhone ? '(' + contactPhone + ')' : '')).trim())
    }
    if (inTime || outTime) addressParts.push('Timings: ' + inTime + ' to ' + outTime)
    if (dist) addressParts.push('Distance: ' + dist + 'm')

    const hotelRes = await fetch(`${apiUrl}/api/hotels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionToken
      },
      body: JSON.stringify({
        name: name,
        code: code,
        location: dist ? dist + 'm away' : null,
        address: addressParts.join(' | '),
        googleMapsLink: mapsLink || null
      })
    })

    if (!hotelRes.ok) {
        console.error('Failed to create hotel: ' + name, await hotelRes.text())
        continue
    }

    const hotel = await hotelRes.json()
    console.log('Created Hotel: ' + hotel.name)

    let capacity = 4
    if (capStr) {
        const match = capStr.match(/\d+/)
        if (match) capacity = parseInt(match[0])
    } else if (totalRooms > 0 && beds > 0) {
        capacity = Math.floor(beds / totalRooms)
    }
    if (capacity === 0) capacity = 4

    let roomNumbers = []
    if (roomStr) {
        roomNumbers = roomStr.split(/[\s,\n\r]+/).map(s => s.trim()).filter(s => s !== '' && s.toLowerCase() !== 'to')
        
        if (roomStr.toLowerCase().includes(' to ')) {
            const parts = roomStr.toLowerCase().split('to').map(s => parseInt(s.trim()))
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                roomNumbers = []
                for (let j = parts[0]; j <= parts[1]; j++) {
                    roomNumbers.push(j.toString())
                }
            }
        }
    } else {
        for (let j = 1; j <= totalRooms; j++) {
            roomNumbers.push('R' + j)
        }
    }

    roomNumbers = [...new Set(roomNumbers)]

    if (roomNumbers.length > 0) {
        const roomStrParam = roomNumbers.join(',')
        const addRoomsRes = await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionToken
          },
          body: JSON.stringify({
            number: roomStrParam,
            capacity: capacity
          })
        })
        if (!addRoomsRes.ok) {
            console.error('Failed to add rooms for hotel: ' + name, await addRoomsRes.text())
        } else {
            console.log('  Added ' + roomNumbers.length + ' rooms with capacity ' + capacity)
        }
    }
  }
}

main()
