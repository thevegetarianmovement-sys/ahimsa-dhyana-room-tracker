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

  // 1. Find and Delete Blue Star Lodge
  const hotelsRes = await fetch(`${apiUrl}/api/hotels`, {
    headers: { 'Cookie': sessionToken }
  })
  const hotels = await hotelsRes.json()
  const blueStar = hotels.find(h => h.name.includes('BLUE STAR'))
  
  if (blueStar) {
    console.log('Deleting existing Blue Star Lodge...')
    await fetch(`${apiUrl}/api/hotels/${blueStar.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionToken }
    })
  }

  // 2. Re-create Blue Star Lodge
  const hotelRes = await fetch(`${apiUrl}/api/hotels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({
      name: 'BLUE STAR LODGE',
      code: 'BLUEST',
      location: null,
      address: 'Contact: / S0MANATH (7672084573) | Timings: 1ST 7AM to 5TH 7AM',
      googleMapsLink: null
    })
  })
  
  const hotel = await hotelRes.json()
  console.log('Recreated Hotel: ' + hotel.name)

  // 3. Create capacity 8 rooms
  const cap8Rooms = '301,302,303,304,G3'
  await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({ number: cap8Rooms, capacity: 8 })
  })
  console.log('Added cap 8 rooms: ' + cap8Rooms)

  // 4. Create capacity 4 rooms
  const cap4Rooms = '101,102,103,104,106,201,202,203,204,205'
  await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({ number: cap4Rooms, capacity: 4 })
  })
  console.log('Added cap 4 rooms: ' + cap4Rooms)
}

main()
