const http = require('http');

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
      adminCookie = cookies.split(';')[0]; // simple parsing
      
      const sessionCheck = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Cookie': adminCookie }
      });
      if (sessionCheck.ok) {
        logResult('TEST 1 - ADMIN AUTH', true, 'Logged in and session persisted.');
      } else {
        logResult('TEST 1 - ADMIN AUTH', false, '/api/auth/me rejected session.');
      }
    } else {
      logResult('TEST 1 - ADMIN AUTH', false, 'Failed to login with admin/password123');
    }

    // TEST 2: Hotel Management
    const hotelsRes = await fetch(`${API_URL}/api/hotels`, {
      headers: { 'Cookie': adminCookie }
    });
    if (hotelsRes.ok) {
      const hotels = await hotelsRes.json();
      if (hotels.length > 0 && hotels[0].rooms) {
        logResult('TEST 2 - HOTEL MANAGEMENT', true, `Loaded ${hotels.length} hotels, Rooms/Beds verified.`);
      } else {
        logResult('TEST 2 - HOTEL MANAGEMENT', false, 'Hotels missing rooms/beds data.');
      }
    } else {
      logResult('TEST 2 - HOTEL MANAGEMENT', false, 'Failed to fetch hotels.');
    }

    // TEST 3: Shad Management
    const shadsRes = await fetch(`${API_URL}/api/shads`, {
      headers: { 'Cookie': adminCookie }
    });
    if (shadsRes.ok) {
      const shads = await shadsRes.json();
      if (shads.length > 0 && shads[0].beds) {
        logResult('TEST 3 - SHAD MANAGEMENT', true, `Loaded ${shads.length} shads with beds.`);
      } else {
        logResult('TEST 3 - SHAD MANAGEMENT', false, 'Shads missing beds data.');
      }
    } else {
      logResult('TEST 3 - SHAD MANAGEMENT', false, 'Failed to fetch shads.');
    }

    // TEST 4: Participants
    const createPartRes = await fetch(`${API_URL}/api/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
      body: JSON.stringify({ name: 'Acceptance Test Participant', phone: '9999999999', registrationNumber: 'ACCEPTANCE-TEST-001' })
    });
    
    let testParticipantId = null;
    if (createPartRes.ok) {
      const p = await createPartRes.json();
      testParticipantId = p.id;
      logResult('TEST 4 - PARTICIPANTS', true, `Created/Verified participant ${p.registrationNumber}`);
    } else if (createPartRes.status === 400 || createPartRes.status === 409) {
      // Might already exist
      const pSearch = await fetch(`${API_URL}/api/participants?q=ACCEPTANCE-TEST-001`, {
        headers: { 'Cookie': adminCookie }
      }).then(r => r.json());
      if (pSearch && pSearch.length > 0) {
        testParticipantId = pSearch[0].id;
        logResult('TEST 4 - PARTICIPANTS', true, 'Found existing test participant.');
      } else {
        logResult('TEST 4 - PARTICIPANTS', false, 'Failed to create or find test participant.');
      }
    } else {
      logResult('TEST 4 - PARTICIPANTS', false, `Status ${createPartRes.status}`);
    }

    // Prepare a bed for TEST 6
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
          bedId: testBedId,
          checkInDate,
          checkOutDate
        })
      });
      
      if (allocRes.ok) {
        const alloc = await allocRes.json();
        allocationId = alloc.id;
        accommodationIdStr = alloc.accommodationId;
        logResult('TEST 6 - ACCOMMODATION ALLOCATION', true, `Success, generated ID: ${accommodationIdStr}`);
      } else {
        const errText = await allocRes.text();
        if (errText.includes('already occupied') || errText.includes('already has an active allocation')) {
          // Fallback to fetch existing allocation
           const pData = await fetch(`${API_URL}/api/participants/${testParticipantId}`, { headers: { 'Cookie': adminCookie } }).then(r=>r.json());
           if (pData.allocations && pData.allocations.length > 0) {
             allocationId = pData.allocations[0].id;
             accommodationIdStr = pData.allocations[0].accommodationId;
             logResult('TEST 6 - ACCOMMODATION ALLOCATION', true, `Found existing allocation: ${accommodationIdStr}`);
           } else {
             logResult('TEST 6 - ACCOMMODATION ALLOCATION', false, `Failed to allocate or find: ${errText}`);
           }
        } else {
          logResult('TEST 6 - ACCOMMODATION ALLOCATION', false, `Error: ${errText}`);
        }
      }
    } else {
      logResult('TEST 6 - ACCOMMODATION ALLOCATION', false, 'Missing testBedId or testParticipantId');
    }

    // TEST 7: Double Booking
    if (testBedId) {
      // Create a dummy participant
      const dummyRes = await fetch(`${API_URL}/api/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
        body: JSON.stringify({ name: 'Dummy Participant', registrationNumber: 'DUMMY-002' })
      });
      let dummyId = null;
      if (dummyRes.ok) dummyId = (await dummyRes.json()).id;
      
      if (dummyId) {
        const checkInDate = new Date().toISOString();
        const checkOutDate = new Date(Date.now() + 86400000).toISOString();
        const dbRes = await fetch(`${API_URL}/api/allocations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
          body: JSON.stringify({
            participantId: dummyId,
            bedId: testBedId,
            checkInDate,
            checkOutDate
          })
        });
        
        if (dbRes.status === 400 || dbRes.status === 409) {
          logResult('TEST 7 - DOUBLE BOOKING', true, `Correctly rejected overlapping booking with status ${dbRes.status}`);
        } else {
          logResult('TEST 7 - DOUBLE BOOKING', false, `Allowed double booking or unexpected status: ${dbRes.status}`);
        }
      } else {
        logResult('TEST 7 - DOUBLE BOOKING', false, 'Could not create dummy participant for test.');
      }
    } else {
      logResult('TEST 7 - DOUBLE BOOKING', false, 'No test bed ID.');
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
    } else {
      logResult('TEST 8 - CHECKOUT', false, 'No active allocation to checkout.');
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
        
        // TEST 15: Cross-location security
        if (pubLocations.hotels.length > 1) {
          const wrongHotelId = pubLocations.hotels[1].id;
          const crossRes = await fetch(`${API_URL}/api/hotels/${wrongHotelId}`, {
            headers: { 'Cookie': volunteerCookie }
          });
          if (crossRes.status === 403 || crossRes.status === 401 || crossRes.status === 404) {
            logResult('TEST 15 - CROSS-LOCATION SECURITY', true, `Rejected access to wrong hotel with status ${crossRes.status}`);
          } else {
            logResult('TEST 15 - CROSS-LOCATION SECURITY', false, `Allowed access to wrong hotel. Status: ${crossRes.status}`);
          }
        } else {
          logResult('TEST 15 - CROSS-LOCATION SECURITY', false, 'Not enough hotels to test cross-location.');
        }
      } else {
        logResult('TEST 14 - VOLUNTEER AUTHENTICATION', false, `Volunteer login failed with status ${vLoginRes.status}`);
      }
    }

    // TEST 17: Search
    const searchRes = await fetch(`${API_URL}/api/participants?q=ACCEPTANCE`, {
      headers: { 'Cookie': adminCookie }
    });
    if (searchRes.ok) {
      const sData = await searchRes.json();
      if (sData.length > 0) {
        logResult('TEST 17 - SEARCH', true, 'Search returned valid results.');
      } else {
        logResult('TEST 17 - SEARCH', false, 'Search returned empty array.');
      }
    } else {
      logResult('TEST 17 - SEARCH', false, 'Search endpoint failed.');
    }

    // Write report logic...
    fs.writeFileSync('e2e-results.json', JSON.stringify({ results, accommodationIdStr }));

  } catch (err) {
    console.error('Fatal Test Error:', err);
  }
}

runTests();
