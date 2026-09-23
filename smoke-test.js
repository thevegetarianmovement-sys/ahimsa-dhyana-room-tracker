const http = require('http');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const { hostname, port, pathname, search } = new URL(url);
    const req = http.request({
      hostname,
      port,
      path: pathname + search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          json: () => JSON.parse(body),
          text: () => body
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SMOKE TEST ---');

  // 1. ADMIN LOGIN
  let adminCookie = '';
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' })
  });
  if (loginRes.status === 200) {
    adminCookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log('ADMIN LOGIN: PASS');
  } else {
    console.log('ADMIN LOGIN: FAIL', await loginRes.text());
    return;
  }

  // 2 & 3. HOTELS API & ROOMS & BEDS
  const hotelsRes = await fetch('http://localhost:4000/api/hotels', {
    headers: { 'Cookie': adminCookie }
  });
  if (hotelsRes.status === 200) {
    const hotels = await hotelsRes.json();
    console.log('HOTEL API LIST: PASS (Found', hotels.length, 'hotels)');
    if (hotels.length > 0) {
      const hotelId = hotels[0].id;
      const hotelRes = await fetch(`http://localhost:4000/api/hotels/${hotelId}`, {
        headers: { 'Cookie': adminCookie }
      });
      const hotel = await hotelRes.json();
      if (hotel.rooms && hotel.rooms.length > 0 && hotel.rooms[0].beds) {
        console.log('HOTEL API DETAILS (ROOMS/BEDS): PASS');
      } else {
        console.log('HOTEL API DETAILS (ROOMS/BEDS): FAIL (Missing relationships)');
      }
    }
  } else {
    console.log('HOTEL API: FAIL', await hotelsRes.text());
  }

  // 4 & 5. SHADS API
  const shadsRes = await fetch('http://localhost:4000/api/shads', {
    headers: { 'Cookie': adminCookie }
  });
  if (shadsRes.status === 200) {
    const shads = await shadsRes.json();
    console.log('SHAD API LIST: PASS (Found', shads.length, 'shads)');
    if (shads.length > 0) {
      const shadId = shads[0].id;
      const shadRes = await fetch(`http://localhost:4000/api/shads/${shadId}`, {
        headers: { 'Cookie': adminCookie }
      });
      const shad = await shadRes.json();
      if (shad.beds && shad.beds.length > 0) {
        console.log('SHAD API DETAILS (BEDS): PASS');
      } else {
        console.log('SHAD API DETAILS (BEDS): FAIL (Missing relationships)');
      }
    }
  } else {
    console.log('SHAD API: FAIL', await shadsRes.text());
  }

  // 6 & 7. NEXT.JS FRONTEND PAGES
  const pagesToTest = ['/dashboard', '/hotels', '/shads'];
  for (const page of pagesToTest) {
    const pageRes = await fetch(`http://localhost:3000${page}`, {
      headers: { 'Cookie': adminCookie }
    });
    if (pageRes.status === 200) {
      console.log(`FRONTEND ${page}: PASS`);
    } else {
      console.log(`FRONTEND ${page}: FAIL (Status ${pageRes.status})`);
    }
  }

  // 8. AUTHORIZATION
  const noAuthRes = await fetch('http://localhost:4000/api/hotels', { method: 'POST' });
  if (noAuthRes.status === 401) {
    console.log('UNAUTHENTICATED REQUEST REJECTED: PASS');
  } else {
    console.log('UNAUTHENTICATED REQUEST REJECTED: FAIL (Status', noAuthRes.status, ')');
  }

  const volLoginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'volunteer', password: 'password123' })
  });
  if (volLoginRes.status === 200) {
    const volCookie = volLoginRes.headers['set-cookie'][0].split(';')[0];
    const volAuthRes = await fetch('http://localhost:4000/api/hotels', {
      method: 'POST',
      headers: { 'Cookie': volCookie }
    });
    if (volAuthRes.status === 403) {
      console.log('VOLUNTEER UNAUTHORIZED MUTATION REJECTED: PASS');
    } else {
      console.log('VOLUNTEER UNAUTHORIZED MUTATION REJECTED: FAIL (Status', volAuthRes.status, ')');
    }
  } else {
    console.log('VOLUNTEER LOGIN: FAIL');
  }

  // 9. REGRESSION
  // Let's get a participant to test the detail page
  const partListRes = await fetch('http://localhost:4000/api/participants', {
    headers: { 'Cookie': adminCookie }
  });
  if (partListRes.status === 200) {
    const participants = await partListRes.json();
    if (participants.length > 0) {
      const partId = participants[0].id;
      const partRes = await fetch(`http://localhost:3000/participants/${partId}`, {
        headers: { 'Cookie': adminCookie }
      });
      if (partRes.status === 200) {
        console.log('ALLOCATION UI REGRESSION: PASS (Participant page loads)');
      } else {
        console.log('ALLOCATION UI REGRESSION: FAIL (Participant page failed)');
      }
    } else {
      console.log('ALLOCATION UI REGRESSION: SKIPPED (No participants found)');
    }
  }

  console.log('--- TEST COMPLETE ---');
}

runTests().catch(console.error);
