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
      console.log(`  Added cap ${group.capacity} rooms: ${group.rooms.substring(0, 50)}...`)
    }
  }

  // A. SAI KIRAN LODGE
  await recreateHotel('SAI KIRAN', {
    name: 'SAI KIRAN LODGE', code: 'SAIKIR', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: '101,201,301,405', capacity: 5 }, // 4 rooms as requested
    { rooms: '102,103,105,104,202,203,205,302,303,305', capacity: 3 } // 10 rooms (includes 102 here)
  ]);

  // B. HOTEL AAHWAANAM
  const aahwaanamRooms = Array.from({length: 30}, (_, i) => i + 1).join(',');
  await recreateHotel('AAHWAANAM', {
    name: 'HOTEL AAHWAANAM', code: 'AAHWAA', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: aahwaanamRooms, capacity: 4 }
  ]);

  // C. HOTEL TULASI
  const tulasiRooms = Array.from({length: 25}, (_, i) => i + 1).join(',');
  await recreateHotel('TULASI', {
    name: 'HOTEL TULASI', code: 'TULASI', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: tulasiRooms, capacity: 4 }
  ]);

  // D. HOTEL SAI PRAKASH
  const spRooms = '101, 102, 103, 104, 106, 107, 108, 109, 110, 111, 112, 113, 201, 202, 203, 204, 205, 207, 208, 209, 210, 211, 214, 215, 216, 217, 220, 221, 222, 223, 224, 226, 227, 228, 230, 231, 232, 233, 234, 301, 302, 303, 305, 306, 307, 308, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334'.replace(/ /g, '');
  await recreateHotel('SAI PRAKASH', {
    name: 'HOTEL SAI PRAKASH', code: 'SAIPRA', location: null, address: '', googleMapsLink: null
  }, [
    { rooms: spRooms, capacity: 4 }
  ]);
}

main()
