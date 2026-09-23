const fs = require('fs');
['src/app/volunteer/hotels/[id]/page.tsx', 'src/app/volunteer/shads/[id]/page.tsx', 'src/app/volunteer/hotels/page.tsx', 'src/app/volunteer/shads/page.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('const sessionCookie')) {
    content = content.replace(
      /export default async function[^\n]+?\n/m,
      "$&  const { cookies } = await import('next/headers');\n  const sessionCookie = cookies().get('session')?.value || '';\n"
    );
    fs.writeFileSync(f, content);
  }
});
