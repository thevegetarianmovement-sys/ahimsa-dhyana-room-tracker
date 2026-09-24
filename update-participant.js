const fs = require('fs');
let content = fs.readFileSync('backend/src/services/participant.service.ts', 'utf8');

content = content.replace(
  "export const bulkCreateParticipants = async (participants: { name: string, phone?: string, registrationNumber?: string }[]) => {",
  "export const bulkCreateParticipants = async (participants: { name: string, phone?: string, registrationNumber?: string, gender?: string }[]) => {"
);

content = content.replace(
  "phone: p.phone || null,",
  "phone: p.phone || null,\n        gender: p.gender || null,"
);

fs.writeFileSync('backend/src/services/participant.service.ts', content);
