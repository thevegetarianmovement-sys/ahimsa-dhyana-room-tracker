const fs = require('fs');
['src/app/api/export/shad/[id]/route.ts', 'src/app/reports/hotels/[id]/page.tsx', 'src/app/reports/shads/[id]/page.tsx', 'src/app/search/page.tsx', 'src/app/participants/page.tsx', 'src/app/volunteer/hotels/page.tsx', 'src/app/volunteer/hotels/[id]/page.tsx', 'src/app/volunteer/shads/page.tsx', 'src/app/volunteer/shads/[id]/page.tsx', 'src/app/participants/import/BulkImportForm.tsx'].forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\\\$/g, '$');
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\n/g, '\n');
    fs.writeFileSync(f, content);
  }
});
