const fs = require('fs');

async function main() {
  const apiUrl = 'https://ahimsa-dhyana-room-tracker-production.up.railway.app'
  const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Ahimsa@#admin' })
  })
  
  const setCookie = loginRes.headers.get('set-cookie')
  const sessionToken = setCookie ? setCookie.split(';')[0] : ''

  async function recreateHotel(nameContains, createData, roomsGroups) {
    const hotelsRes = await fetch(`${apiUrl}/api/hotels`, { headers: { 'Cookie': sessionToken } })
    const hotels = await hotelsRes.json()
    const match = hotels.find(h => h.name.toUpperCase().includes(nameContains.toUpperCase()))
    
    if (match) {
      console.log(`Deleting existing ${match.name}...`)
      await fetch(`${apiUrl}/api/hotels/${match.id}`, { method: 'DELETE', headers: { 'Cookie': sessionToken } })
    }

    createData.code = createData.code + Math.floor(Math.random()*1000)
    
    const hotelRes = await fetch(`${apiUrl}/api/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
      body: JSON.stringify(createData)
    })
    
    const hotel = await hotelRes.json()
    if (!hotel.id) {
        console.error("Failed to create hotel " + createData.name)
        return
    }
    console.log(`Recreated Hotel: ${hotel.name}`)

    for (const group of roomsGroups) {
      await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
        body: JSON.stringify({ number: group.rooms, capacity: group.capacity })
      })
      console.log(`  Added cap ${group.capacity} rooms: ${group.rooms}`)
    }
  }

  // 1. BLUE STAR LODGE
  await recreateHotel('BLUE STAR LODGE', {
    name: 'BLUE STAR LODGE', code: 'BLUEST', location: null, address: 'Contact: 7672084573 / S0MANATH | Timings: 1ST 7AM to 5TH 7AM', googleMapsLink: null
  }, [
    { rooms: '103,204,304,404', capacity: 4 },
    { rooms: '102,201,202,203,301,302,303,401,402,403', capacity: 3 }
  ]);

  // 2. NEW STAR LODGE
  await recreateHotel('NEW STAR LODGE', {
    name: 'NEW STAR LODGE', code: 'NEWSTA', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: '301,302,303,304', capacity: 10 },
    // Removed duplicate 201 from the remaining list
    { rooms: '201,202,203,204,205,207,208,101,102,103,104,105,107,108,109', capacity: 4 }
  ]);
}

main()
