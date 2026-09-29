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
      code: 'BLUEST' + Math.floor(Math.random()*100),
      location: null,
      address: 'Contact: 7672084573 / S0MANATH | Timings: 1ST 7AM to 5TH 7AM',
      googleMapsLink: null
    })
  })
  
  const hotel = await hotelRes.json()
  console.log('Recreated Hotel: ' + hotel.name)

  // 3. Create capacity 4 rooms
  const cap4Rooms = '103,204,304,404'
  await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({ number: cap4Rooms, capacity: 4 })
  })
  console.log('Added cap 4 rooms: ' + cap4Rooms)

  // 4. Create capacity 3 rooms
  // 4 rooms of 4 = 16 beds. Total 46. Remaining = 30 beds. 30/3 = 10 rooms.
  // Using the rest of the numbers from the CSV (excluding the ones now in cap 4).
  const cap3Rooms = '101,102,104,106,201,202,203,205,301,302'
  await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({ number: cap3Rooms, capacity: 3 })
  })
  console.log('Added cap 3 rooms: ' + cap3Rooms)
}

main()
