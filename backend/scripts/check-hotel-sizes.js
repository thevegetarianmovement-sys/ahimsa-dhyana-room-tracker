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
  const ready = hotels.filter(h => h.rooms.length > 0)
  const notReady = hotels.filter(h => h.rooms.length === 0)
  console.log('Ready:', ready.length, 'Not Ready:', notReady.length)
}
test()
