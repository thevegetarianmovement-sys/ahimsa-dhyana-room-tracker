const http = require('http');

async function testParticipants() {
  console.log('--- STARTING PARTICIPANT TEST ---');
  try {
    // 1. Login to get session
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    const setCookieHeader = loginRes.headers.get('set-cookie');
    const sessionCookie = setCookieHeader.split(';')[0];
    
    // 2. Create Participant
    console.log('\nCreating participant via API...');
    const createRes = await fetch('http://localhost:4000/api/participants', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({
        name: 'API Test User',
        registrationNumber: 'TEST-123',
        phone: '9999999999',
        gender: 'MALE'
      })
    });
    
    const created = await createRes.json();
    console.log('Created:', created.id, created.name);
    
    if (!created.id) {
      console.log('FAIL: Did not return participant ID');
      return;
    }

    // 3. List Participants
    console.log('\nListing participants via API...');
    const listRes = await fetch('http://localhost:4000/api/participants?q=TEST', {
      headers: { 'Cookie': sessionCookie }
    });
    const list = await listRes.json();
    console.log('Found participants matching "TEST":', list.length);
    if (!list.some(p => p.id === created.id)) {
      console.log('FAIL: Created participant not in list');
      return;
    }

    console.log('\nALL PARTICIPANT API TESTS PASSED.');
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testParticipants();
