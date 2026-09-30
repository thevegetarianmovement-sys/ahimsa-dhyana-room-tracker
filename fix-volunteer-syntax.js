const fs = require('fs');

function fixSyntax(path) {
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(
    /\{hotels\.map\(\(hotel: any\) => \(\s*\{\(\(\) => \{/g,
    '{hotels.map((hotel: any) => {\n            const capacityCounts: Record<number, number> = {}\n            hotel.rooms?.forEach((r: any) => {\n              const cap = r.beds?.length || 0\n              capacityCounts[cap] = (capacityCounts[cap] || 0) + 1\n            })\n\n            return (\n              <Link href={`/volunteer/hotels/${hotel.id}`} key={hotel.id}'
  );

  content = content.replace(
    /<\/Link>\s*\)\}\)\(\)\}/g,
    '</Link>\n            )'
  );

  fs.writeFileSync(path, content);
}

fixSyntax('src/app/volunteer/hotels/page.tsx');
console.log('Fixed syntax error in volunteer hotels');
