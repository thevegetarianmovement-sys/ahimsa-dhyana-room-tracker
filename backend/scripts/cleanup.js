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

  const hotelsRes = await fetch(`${apiUrl}/api/hotels`, {
    headers: { 'Cookie': sessionToken }
  })
  const hotels = await hotelsRes.json()
  
  for (const h of hotels) {
      if (h.rooms.length === 0) {
          // It's probably one of the broken ones
          console.log('Deleting broken hotel: ' + h.name)
          await fetch(`${apiUrl}/api/hotels/${h.id}`, {
              method: 'DELETE',
              headers: { 'Cookie': sessionToken }
          })
      }
  }
}
main()
