const fs = require('fs');

async function runTests() {
  const API_URL = 'http://127.0.0.1:4000';
  let adminCookie = '';
  let volunteerCookie = '';
  let results = [];

  const logResult = (testName, pass, details) => {
    results.push({ test: testName, result: pass ? 'PASS' : 'FAIL', details });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${testName}: ${details}`);
  };

  try {
    // TEST 1: Admin Auth
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      const cookies = loginRes.headers.get('set-cookie');
      adminCookie = cookies.split(';')[0];
      logResult('TEST 1 - ADMIN AUTH', true, 'Logged in and session persisted.');
    }

    // TEST 4: Participants
    const createPartRes = await fetch(`${API_URL}/api/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
      body: JSON.stringify({ name: 'Acceptance Test Participant', phone: '9999999999', registrationNumber: 'ACCEPTANCE-TEST-001' })
    });
    let testParticipantId = null;
    if (createPartRes.ok) {
      testParticipantId = (await createPartRes.json()).id;
    } else {
      const pSearch = await fetch(`${API_URL}/api/participants?q=ACCEPTANCE-TEST-001`, {
        headers: { 'Cookie': adminCookie }
      }).then(r => r.json());
      if (pSearch && pSearch.length > 0) testParticipantId = pSearch[0].id;
    }

    let testBedId = null;
    const hotels = await fetch(`${API_URL}/api/hotels`, { headers: { 'Cookie': adminCookie } }).then(r=>r.json());
    if (hotels[0] && hotels[0].rooms[0] && hotels[0].rooms[0].beds[0]) {
      testBedId = hotels[0].rooms[0].beds[0].id;
    }

    // TEST 6: Accommodation Allocation
    let allocationId = null;
    let accommodationIdStr = null;
    if (testBedId && testParticipantId) {
      const checkInDate = new Date().toISOString();
      const checkOutDate = new Date(Date.now() + 86400000).toISOString();
      
      const allocRes = await fetch(`${API_URL}/api/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
        body: JSON.stringify({
          participantId: testParticipantId,
          data: {
            type: 'HOTEL',
            bedId: testBedId,
            checkInDate,
            checkOutDate
          }
        })
      });
      
      if (allocRes.ok) {
        const alloc = await allocRes.json();
        allocationId = alloc.id;
        accommodationIdStr = alloc.accommodationId;
        logResult('TEST 6 - ACCOMMODATION ALLOCATION', true, `Success, generated ID: ${accommodationIdStr}`);
      } else {
        const errText = await allocRes.text();
        logResult('TEST 6 - ACCOMMODATION ALLOCATION', false, `Failed: ${errText}`);
      }
    }

    // TEST 8: Checkout
    if (allocationId) {
      const coRes = await fetch(`${API_URL}/api/allocations/${allocationId}/checkout`, {
        method: 'POST',
        headers: { 'Cookie': adminCookie }
      });
      if (coRes.ok) {
        logResult('TEST 8 - CHECKOUT', true, 'Checkout succeeded.');
      } else {
        logResult('TEST 8 - CHECKOUT', false, `Failed with status ${coRes.status}`);
      }
    }

    // TEST 13 & 14 & 15: Volunteer Auth & Security
    const pubLocations = await fetch(`${API_URL}/api/public/locations`).then(r=>r.json());
    if (pubLocations.hotels?.length > 0) {
      const targetHotel = pubLocations.hotels[0].id;
      
      const vLoginRes = await fetch(`${API_URL}/api/auth/volunteer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: targetHotel, passcode: 'JALSA2026', type: 'HOTEL' })
      });
      
      if (vLoginRes.ok) {
        const vCookies = vLoginRes.headers.get('set-cookie');
        volunteerCookie = vCookies.split(';')[0];
        logResult('TEST 14 - VOLUNTEER AUTHENTICATION', true, 'Volunteer logged in successfully.');
        
        if (pubLocations.hotels.length > 1) {
          const wrongHotelId = pubLocations.hotels[1].id;
          const crossRes = await fetch(`${API_URL}/api/hotels/${wrongHotelId}`, {
            headers: { 'Cookie': volunteerCookie }
          });
          if (crossRes.status === 403) {
            logResult('TEST 15 - CROSS-LOCATION SECURITY', true, `Rejected access to wrong hotel with status 403`);
          } else {
            logResult('TEST 15 - CROSS-LOCATION SECURITY', false, `Allowed access to wrong hotel. Status: ${crossRes.status}`);
          }
        }
      } else {
        logResult('TEST 14 - VOLUNTEER AUTHENTICATION', false, `Volunteer login failed with status ${vLoginRes.status}`);
      }
    }

  } catch (err) {
    console.error('Fatal Test Error:', err);
  }
}

runTests();
