async function test() {
  const apiUrl = 'https://ahimsa-dhyana-room-tracker-production.up.railway.app'
  const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Ahimsa@#admin' })
  })
  const setCookie = loginRes.headers.get('set-cookie')
  const sessionToken = setCookie ? setCookie.split(';')[0] : ''

  const res = await fetch(`${apiUrl}/api/hotels`, { headers: { 'Cookie': sessionToken } })
  const hotels = await res.json()
  const blueStar = hotels.find(h => h.name.includes('BLUE STAR'))
  
  if (!blueStar) {
    console.log('Not found')
    return
  }
  console.log('Hotel ID:', blueStar.id)
  
  const hRes = await fetch(`${apiUrl}/api/hotels/${blueStar.id}`, { headers: { 'Cookie': sessionToken } })
  const details = await hRes.json()
  console.log(details.rooms.map(r => r.number))
}
test()
