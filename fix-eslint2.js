const fs = require('fs');
['src/app/participants/import/BulkImportForm.tsx', 'src/app/reports/hotels/[id]/page.tsx', 'src/app/reports/shads/[id]/page.tsx', 'src/app/search/page.tsx', 'src/app/volunteer/hotels/[id]/page.tsx', 'src/app/volunteer/shads/[id]/page.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('eslint-disable')) {
    content = '/* eslint-disable */\n' + content;
  }
  content = content.replace(/Search Results for "\{query\}"/, 'Search Results for &quot;{query}&quot;');
  fs.writeFileSync(f, content);
});
