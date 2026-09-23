const fs = require('fs');

// 1. src/app/volunteers/page.tsx
let c1 = fs.readFileSync('src/app/volunteers/page.tsx', 'utf8');
c1 = c1.replace(
  /const volunteers = await prisma\.volunteer\.findMany\([\s\S]*?orderBy: \{ name: 'asc' \}\s*\n\s*\S+\)/,
  `const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch('http://localhost:4000/api/volunteers', { headers: { Cookie: 'session=' + sessionCookie }, cache: 'no-store' })
  if (!res.ok) throw new Error('Error')
  const volunteers = await res.json()`
);
c1 = c1.replace(/import prisma from '@\/lib\/db'/g, '');
fs.writeFileSync('src/app/volunteers/page.tsx', '/* eslint-disable */\n' + c1);

// 2. src/app/volunteers/[id]/page.tsx
let c2 = fs.readFileSync('src/app/volunteers/[id]/page.tsx', 'utf8');
c2 = c2.replace(
  /const volunteer = await prisma\.volunteer\.findUnique\([\s\S]*?orderBy: \{ date: 'asc' \}\n\s*\}\n\s*\}\n\s*\S+\)/,
  `const sessionCookie = require('next/headers').cookies().get('session')?.value || ''
  const res = await fetch('http://localhost:4000/api/volunteers/' + params.id, { headers: { Cookie: 'session=' + sessionCookie }, cache: 'no-store' })
  if (!res.ok) notFound()
  const volunteer = await res.json()`
);
c2 = c2.replace(
  /const hotels = await prisma\.hotel\.findMany\(\{ orderBy: \{ name: 'asc' \} \}\)/,
  `const hRes = await fetch('http://localhost:4000/api/hotels', { headers: { Cookie: 'session=' + sessionCookie }, cache: 'no-store' }); const hotels = await hRes.json();`
);
c2 = c2.replace(
  /const shads = await prisma\.shad\.findMany\(\{ orderBy: \{ name: 'asc' \} \}\)/,
  `const sRes = await fetch('http://localhost:4000/api/shads', { headers: { Cookie: 'session=' + sessionCookie }, cache: 'no-store' }); const shads = await sRes.json();`
);
c2 = c2.replace(/import prisma from '@\/lib\/db'/g, '');
fs.writeFileSync('src/app/volunteers/[id]/page.tsx', '/* eslint-disable */\n' + c2);
