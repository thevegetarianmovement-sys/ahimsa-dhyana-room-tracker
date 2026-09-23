const fs = require('fs');
let content = fs.readFileSync('src/app/participants/import/BulkImportForm.tsx', 'utf8');
content = content.replace(
  /const res = await bulkCreateParticipants\(dataToUpload\)/g,
  `const response = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/participants/bulk\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ participants: dataToUpload }) }); if(!response.ok) throw new Error('Failed to bulk import'); const res = await response.json();`
);
fs.writeFileSync('src/app/participants/import/BulkImportForm.tsx', content);
