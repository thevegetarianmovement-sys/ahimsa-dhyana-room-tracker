const http = require('http');

async function testAuth() {
  console.log('--- STARTING AUTH TEST ---');
  try {
    // 1. Admin Login to Express Backend
    console.log('1. Testing Admin Login...');
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    
    if (!loginRes.ok) {
      console.log('FAIL: Admin login failed. Status:', loginRes.status);
      return;
    }
    
    const loginData = await loginRes.json();
    console.log('Admin login response:', loginData);
    
    // Extract Set-Cookie
    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (!setCookieHeader || !setCookieHeader.includes('session=')) {
      console.log('FAIL: Session cookie not set by Express.');
      return;
    }
    const sessionCookie = setCookieHeader.split(';')[0];
    console.log('Cookie obtained:', sessionCookie.substring(0, 30) + '...');

    // 2. Test Express Session Validation
    console.log('\n2. Testing Express Session Check...');
    const sessionRes = await fetch('http://localhost:4000/api/auth/session', {
      headers: { 'Cookie': sessionCookie }
    });
    const sessionData = await sessionRes.json();
    console.log('Express session response:', sessionData);
    if (!sessionData.user || sessionData.user.role !== 'ADMIN') {
      console.log('FAIL: Express session endpoint did not return correct user.');
      return;
    }

    // 3. Test Next.js Middleware with the Cookie
    console.log('\n3. Testing Next.js Middleware (Admin accessing /dashboard)...');
    const nextRes = await fetch('http://localhost:3000/dashboard', {
      headers: { 'Cookie': sessionCookie },
      redirect: 'manual'
    });
    console.log('Next.js /dashboard status:', nextRes.status);
    if (nextRes.status >= 300 && nextRes.status < 400) {
      console.log('FAIL: Admin was redirected away from /dashboard (probably to /login or /volunteer). Location:', nextRes.headers.get('location'));
      return;
    } else {
      console.log('PASS: Admin is allowed on /dashboard.');
    }

    // 4. Test Volunteer Login
    console.log('\n4. Testing Volunteer Login...');
    const volLoginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'volunteer', password: 'password123' })
    });
    const volSetCookie = volLoginRes.headers.get('set-cookie');
    const volSessionCookie = volSetCookie.split(';')[0];

    // 5. Test Next.js Middleware (Volunteer accessing /dashboard)
    console.log('\n5. Testing Next.js Middleware (Volunteer accessing /dashboard)...');
    const nextVolRes = await fetch('http://localhost:3000/dashboard', {
      headers: { 'Cookie': volSessionCookie },
      redirect: 'manual' // don't follow redirects automatically
    });
    console.log('Next.js /dashboard status for volunteer:', nextVolRes.status);
    if (nextVolRes.status >= 300 && nextVolRes.status < 400) {
      const location = nextVolRes.headers.get('location');
      console.log('PASS: Volunteer was correctly redirected to:', location);
      if (!location.includes('/volunteer')) {
        console.log('FAIL: Volunteer redirected to wrong location (expected /volunteer).');
        return;
      }
    } else {
      console.log('FAIL: Volunteer was NOT blocked from /dashboard.');
      return;
    }
    
    console.log('\nALL TESTS PASSED.');
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testAuth();
