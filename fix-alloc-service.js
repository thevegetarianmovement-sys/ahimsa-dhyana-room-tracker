const fs = require('fs');

function updateAllocationService() {
  const file = 'backend/src/services/allocation.service.ts';
  let content = fs.readFileSync(file, 'utf8');

  // 1. Update registerAndAllocate arguments
  content = content.replace(
    /data: \{ name: string, registrationNumber\?: string, phone\?: string, checkOutDate\?: string \}/,
    "data: { name: string, registrationNumber?: string, phone?: string, checkOutDate?: string, gender?: string }"
  );

  // 2. Add gender to participant create in registerAndAllocate
  const singleCreateSearch = `      data: {
        registrationNumber: regNum,
        name: data.name,
        phone: data.phone || null,
      }
    })`;
  const singleCreateReplace = `      data: {
        registrationNumber: regNum,
        name: data.name,
        phone: data.phone || null,
        gender: data.gender || null,
      }
    })`;
  content = content.replace(singleCreateSearch, singleCreateReplace);


  // 3. Update groupRegisterAndAllocate arguments
  content = content.replace(
    /people: \{ name: string, registrationNumber\?: string, phone\?: string, checkOutDate\?: string \}\[\]/,
    "people: { name: string, registrationNumber?: string, phone?: string, checkOutDate?: string, gender?: string }[]"
  );

  // 4. Add gender to participant create in groupRegisterAndAllocate
  const groupCreateSearch = `      const p = await prisma.participant.create({
        data: {
          registrationNumber: regNum,
          name: data.name.trim(),
          phone: data.phone || null,
        }
      })`;
  const groupCreateReplace = `      const p = await prisma.participant.create({
        data: {
          registrationNumber: regNum,
          name: data.name.trim(),
          phone: data.phone || null,
          gender: data.gender || null,
        }
      })`;
  content = content.replace(groupCreateSearch, groupCreateReplace);

  fs.writeFileSync(file, content);
}

updateAllocationService();
