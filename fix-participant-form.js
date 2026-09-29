const fs = require('fs');
let content = fs.readFileSync('src/app/participants/[id]/page.tsx', 'utf8');
content = content.replace(
  '<ParticipantForm initialData={participant}\n          />\n          <DeleteParticipantButton',
  '<ParticipantForm initialData={participant} categories={categories} />\n          <DeleteParticipantButton'
);
fs.writeFileSync('src/app/participants/[id]/page.tsx', content);
