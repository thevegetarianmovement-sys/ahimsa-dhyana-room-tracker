const fs = require('fs');

const path = 'backend/src/services/allocation.service.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace the signature
content = content.replace(
  /export const familyBookAndAllocate = async \(\s*data: \{ name: string, phone\?: string, gender\?: string, checkInDate\?: string, checkOutDate\?: string \},/g,
  "export const familyBookAndAllocate = async (\n  data: { name: string, phone?: string, maleCount?: number, femaleCount?: number, checkInDate?: string, checkOutDate?: string },\n"
);

// Replace the creation logic
const oldLogicRegex = /\/\/ Create single participant[\s\S]*?(?=\/\/ Create allocations linked to this single participant)/;
const newLogic = `
  const inDate = data.checkInDate ? new Date(data.checkInDate) : new Date();
  let outDate = new Date('2099-12-31T00:00:00Z');
  if (data.checkOutDate) {
    outDate = new Date(data.checkOutDate);
  }

  let maleRemaining = data.maleCount || 0;
  let femaleRemaining = data.femaleCount || 0;
`;

content = content.replace(oldLogicRegex, newLogic);

const oldLoopRegex = /\/\/ Create allocations linked to this single participant[\s\S]*?return allocations;\n\s*\}/;
const newLoop = `// Create separate participants and allocations for each bed in the family
  const allocations = [];
  const startCount = await prisma.participant.count();
  
  for (let i = 0; i < targetBedIds.length; i++) {
    const bId = targetBedIds[i];
    const regNum = \`FAM-\${1000 + startCount + 1 + i}\`;
    
    let pGender = null;
    if (maleRemaining > 0) {
      pGender = 'MALE';
      maleRemaining--;
    } else if (femaleRemaining > 0) {
      pGender = 'FEMALE';
      femaleRemaining--;
    }

    const p = await prisma.participant.create({
      data: {
        registrationNumber: regNum,
        name: data.name.trim() + (targetBedIds.length > 1 ? \` (\${i + 1})\` : ''),
        phone: data.phone || null,
        gender: pGender,
      }
    });

    const alloc = await prisma.accommodationAllocation.create({
      data: {
        accommodationId: \`FAM-\${Date.now()}-\${Math.random().toString(36).substring(7)}\`,
        participantId: p.id,
        bedId: type === 'HOTEL' ? bId : null,
        shadBedId: type === 'SHAD' ? bId : null,
        checkInDate: inDate,
        checkOutDate: outDate,
        status: 'ACTIVE'
      }
    });
    allocations.push(alloc);
  }

  return allocations;
}`;

content = content.replace(oldLoopRegex, newLoop);
fs.writeFileSync(path, content);
console.log('Fixed backend service for family genders');
