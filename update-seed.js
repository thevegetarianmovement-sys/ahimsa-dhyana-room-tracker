const fs = require('fs');
let content = fs.readFileSync('backend/prisma/seed.ts', 'utf8');
const injection = `
  const existingHotel = await prisma.hotel.findFirst()
  if (existingHotel) {
    console.log('Seed: Baseline data already exists. Skipping hotel/shad generation.')
    return
  }
`;
content = content.replace('// 1. Create Hotels', injection + '\n  // 1. Create Hotels');
fs.writeFileSync('backend/prisma/seed.ts', content);
