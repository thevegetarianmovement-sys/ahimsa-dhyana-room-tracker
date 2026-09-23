const fs = require('fs');

let form = fs.readFileSync('src/app/participants/import/BulkImportForm.tsx', 'utf8');

// Remove import
form = form.replace(/import \{ bulkCreateParticipants \} from '@\/app\/actions\/participant'\n/, '');

// Replace function call
form = form.replace(
  /const result = await bulkCreateParticipants\(validParticipants\)/,
  `const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/participants/bulk\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participants: validParticipants })
      })
      if (!res.ok) throw new Error('Failed to bulk import')
      const result = await res.json()`
);

fs.writeFileSync('src/app/participants/import/BulkImportForm.tsx', form);
