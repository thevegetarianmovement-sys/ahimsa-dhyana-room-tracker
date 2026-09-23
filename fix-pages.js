const fs = require('fs');

function migratePage(pathStr) {
  let content = fs.readFileSync(pathStr, 'utf8');
  content = content.replace(/import prisma from ['"]@\/lib\/db['"]\r?\n/, '');
  
  // Replace hotels fetch
  content = content.replace(
    /const hotels = await prisma\.hotel\.findMany\(\{[\s\S]*?\}\)/,
    `const hRes = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/hotels\`, { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' }); const hotels = hRes.ok ? await hRes.json() : [];`
  );
  
  // Replace shads fetch
  content = content.replace(
    /const shads = await prisma\.shad\.findMany\(\{[\s\S]*?\}\)/,
    `const sRes = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/shads\`, { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' }); const shads = sRes.ok ? await sRes.json() : [];`
  );
  
  // Also for findUnique:
  content = content.replace(
    /const hotel = await prisma\.hotel\.findUnique\(\{[\s\S]*?\}\)/,
    `const hRes = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/hotels/\${params.id}\`, { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' }); const hotel = hRes.ok ? await hRes.json() : null;`
  );
  
  content = content.replace(
    /const shad = await prisma\.shad\.findUnique\(\{[\s\S]*?\}\)/,
    `const sRes = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/shads/\${params.id}\`, { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' }); const shad = sRes.ok ? await sRes.json() : null;`
  );

  fs.writeFileSync(pathStr, content);
  console.log('Migrated', pathStr);
}

migratePage('src/app/participants/page.tsx');
migratePage('src/app/volunteer/hotels/page.tsx');
migratePage('src/app/volunteer/hotels/[id]/page.tsx');
migratePage('src/app/volunteer/shads/page.tsx');
migratePage('src/app/volunteer/shads/[id]/page.tsx');
