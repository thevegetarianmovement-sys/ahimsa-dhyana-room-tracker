const fs = require('fs');

const file = 'backend/src/services/allocation.service.ts';
let content = fs.readFileSync(file, 'utf8');

const newService = `
export const familyBookAndAllocate = async (
  data: { name: string, phone?: string, gender?: string, checkOutDate?: string },
  locationId: string,
  type: 'HOTEL' | 'SHAD',
  bookingParams: { autoCount?: number, bedIds?: string[] }
) => {
  let targetBedIds: string[] = [];

  if (bookingParams.bedIds && bookingParams.bedIds.length > 0) {
    // MANUAL SELECT
    targetBedIds = bookingParams.bedIds;
    
    // Verify they are actually empty
    for (const bId of targetBedIds) {
      let existing = null;
      if (type === 'HOTEL') {
        existing = await prisma.accommodationAllocation.findFirst({ where: { bedId: bId, status: 'ACTIVE' } });
      } else {
        existing = await prisma.accommodationAllocation.findFirst({ where: { shadBedId: bId, status: 'ACTIVE' } });
      }
      if (existing) {
        throw new Error('One or more selected beds were just booked by someone else.');
      }
    }
  } else if (bookingParams.autoCount && bookingParams.autoCount > 0) {
    // AUTO ASSIGN
    if (type === 'HOTEL') {
      const rooms = await prisma.room.findMany({
        where: { hotelId: locationId },
        include: {
          beds: {
            include: { allocations: { where: { status: 'ACTIVE' } } }
          }
        },
        orderBy: { number: 'asc' }
      });
      
      const emptyBeds = [];
      for (const r of rooms) {
        // Sort beds numerically in room
        const sortedBeds = r.beds.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
        for (const b of sortedBeds) {
          if (b.allocations.length === 0) {
            emptyBeds.push(b.id);
          }
        }
      }
      
      if (emptyBeds.length < bookingParams.autoCount) {
        throw new Error(\`Not enough available beds. Need \${bookingParams.autoCount}, but only \${emptyBeds.length} available.\`);
      }
      targetBedIds = emptyBeds.slice(0, bookingParams.autoCount);
    } else {
      // SHAD
      const shadBeds = await prisma.shadBed.findMany({
        where: { shadId: locationId },
        include: { allocations: { where: { status: 'ACTIVE' } } }
      });
      
      const emptyBeds = shadBeds
        .filter(b => b.allocations.length === 0)
        .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
        .map(b => b.id);
        
      if (emptyBeds.length < bookingParams.autoCount) {
        throw new Error(\`Not enough available beds. Need \${bookingParams.autoCount}, but only \${emptyBeds.length} available.\`);
      }
      targetBedIds = emptyBeds.slice(0, bookingParams.autoCount);
    }
  } else {
    throw new Error('Must provide either autoCount or bedIds');
  }

  // Create single participant
  const count = await prisma.participant.count();
  const regNum = \`FAM-\${1000 + count + 1}\`;

  const p = await prisma.participant.create({
    data: {
      registrationNumber: regNum,
      name: data.name.trim(),
      phone: data.phone || null,
      gender: data.gender || null,
    }
  });

  const inDate = new Date();
  let outDate = new Date('2099-12-31T00:00:00Z');
  if (data.checkOutDate) {
    outDate = new Date(data.checkOutDate);
  }

  // Create allocations linked to this single participant
  const allocations = [];
  for (const bId of targetBedIds) {
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
}
`;

content += newService;
fs.writeFileSync(file, content);
