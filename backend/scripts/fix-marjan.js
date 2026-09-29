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

  // 1. Find and Delete MARJAN INTERNATIONAL
  const hotelsRes = await fetch(`${apiUrl}/api/hotels`, {
    headers: { 'Cookie': sessionToken }
  })
  const hotels = await hotelsRes.json()
  const marjan = hotels.find(h => h.name.includes('MARJAN INTERNATIONAL'))
  
  if (marjan) {
    console.log('Deleting existing MARJAN INTERNATIONAL...')
    await fetch(`${apiUrl}/api/hotels/${marjan.id}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionToken }
    })
  }

  // 2. Re-create MARJAN INTERNATIONAL
  const hotelRes = await fetch(`${apiUrl}/api/hotels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({
      name: 'MARJAN INTERNATIONAL',
      code: 'MARJAN' + Math.floor(Math.random()*100),
      location: null,
      address: 'Contact: 8121621888 / PRDEEP | Parking: 10 Cars, 4 Bikes | Timings: 1st 9am to 6th 9am',
      googleMapsLink: 'https://maps.app.goo.gl/8Egx8raHgarVC3u9A?g_st=ac'
    })
  })
  
  const hotel = await hotelRes.json()
  console.log('Recreated Hotel: ' + hotel.name)

  // 3. Create capacity 4 rooms (26 through 55)
  const roomArr = []
  for (let i = 26; i <= 55; i++) {
    roomArr.push(i.toString())
  }
  const cap4Rooms = roomArr.join(',')
  
  await fetch(`${apiUrl}/api/hotels/${hotel.id}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionToken },
    body: JSON.stringify({ number: cap4Rooms, capacity: 4 })
  })
  console.log('Added cap 4 rooms: ' + cap4Rooms)
}

main()
