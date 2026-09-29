const fs = require('fs');
let content = fs.readFileSync('src/app/participants/[id]/page.tsx', 'utf8');
content = 'import DeleteParticipantButton from "@/components/participants/DeleteParticipantButton"\n' + content;
content = content.replace(
  'initialData={participant}',
  'initialData={participant}\n          />\n          <DeleteParticipantButton participantId={participant.id}'
);
fs.writeFileSync('src/app/participants/[id]/page.tsx', content);
