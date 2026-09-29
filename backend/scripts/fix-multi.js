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

  // A. GOPI RESIDENCY
  await recreateHotel('GOPI RESIDENCY', {
    name: 'GOPI RESIDENCY', code: 'GOPI', location: null, address: 'Contact: 9966510999 / OWNER SIR (8977797786) | Timings: 1ST 7AM to 6TH 7AM', googleMapsLink: 'https://maps.app.goo.gl/TS2kbvRoxpL9fHYS9?g_st=ac'
  }, [
    { rooms: '203,204,205,207,209,210,211,303,302,304,305,306,307,308,309,310,R17,R18,R19,R20', capacity: 3 }
  ]);

  // B. THREE CASTLE
  await recreateHotel('THREE CASTLE', {
    name: 'THREE CASTLE', code: 'THREE', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: '64,65,66,67,68,69,70,71,72,73,74,80,81,83,84,85,86,87,88,92,58,60,61,62,54', capacity: 3 },
    { rooms: '77,78,79,94,95', capacity: 5 }
  ]);

  // C. SRI SAI RESIDENCY
  await recreateHotel('SRI SAI RESIDENCY', {
    name: 'SRI SAI RESIDENCY', code: 'SRISAI', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: '403,404,303,204,401', capacity: 4 },
    { rooms: '302,305,306,201,206,304,102', capacity: 3 } // skipped duplicate 401
  ]);

  // D. HOTEL AADAAB
  await recreateHotel('HOTEL AADAAB', {
    name: 'HOTEL AADAAB', code: 'AADAAB', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: '1,2,4,5,6,7,110,111,112', capacity: 4 },
    { rooms: '8', capacity: 8 }
  ]);
}

main()
