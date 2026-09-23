const fs = require('fs');

function fixReportList(pathStr, type) {
  let content = fs.readFileSync(pathStr, 'utf8');
  content = content.replace(/import prisma from ['"]@\/lib\/db['"]\r?\n/, '');
  content = `import { cookies } from 'next/headers'
` + content;
  
  if (type === 'hotel') {
    content = content.replace(
      /const hotels = await prisma\.hotel\.findMany\(\{[\s\S]*?orderBy: \{ name: 'asc' \}\r?\n\s*\}\)/,
      `const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/hotels\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  const hotels = res.ok ? await res.json() : []`
    );
  } else {
    content = content.replace(
      /const shads = await prisma\.shad\.findMany\(\{[\s\S]*?orderBy: \{ name: 'asc' \}\r?\n\s*\}\)/,
      `const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/shads\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  const shads = res.ok ? await res.json() : []`
    );
  }
  fs.writeFileSync(pathStr, content);
}

function fixReportDetail(pathStr, type) {
  let content = fs.readFileSync(pathStr, 'utf8');
  content = content.replace(/import prisma from ['"]@\/lib\/db['"]\r?\n/, '');
  content = `import { cookies } from 'next/headers'
` + content;
  
  if (type === 'hotel') {
    content = content.replace(
      /const hotel = await prisma\.hotel\.findUnique\(\{[\s\S]*?orderBy: \{ number: 'asc' \}\r?\n\s*\}\r?\n\s*\}\)/,
      `const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/hotels/\${params.id}\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  const hotel = res.ok ? await res.json() : null`
    );
  } else {
    content = content.replace(
      /const shad = await prisma\.shad\.findUnique\(\{[\s\S]*?orderBy: \{ number: 'asc' \}\r?\n\s*\}\r?\n\s*\}\)/,
      `const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/shads/\${params.id}\`, {
    headers: { Cookie: \`session=\${sessionCookie}\` },
    cache: 'no-store'
  })
  const shad = res.ok ? await res.json() : null`
    );
  }
  fs.writeFileSync(pathStr, content);
}

fixReportList('src/app/reports/hotels/page.tsx', 'hotel');
fixReportList('src/app/reports/shads/page.tsx', 'shad');
fixReportDetail('src/app/reports/hotels/[id]/page.tsx', 'hotel');
fixReportDetail('src/app/reports/shads/[id]/page.tsx', 'shad');
