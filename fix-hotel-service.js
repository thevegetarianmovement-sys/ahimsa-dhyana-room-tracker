const fs = require('fs');
let service = fs.readFileSync('backend/src/services/hotel.service.ts', 'utf8');

service = service.replace(
  /export const createHotel = async \(data: \{ name: string, code: string, location: string, numRooms: number, bedsPerRoom: number \}\) => \{[\s\S]*?return hotel\n\}/,
  `export const createHotel = async (data: { name: string, code: string, location: string }) => {
  const hotel = await prisma.hotel.create({
    data: {
      name: data.name,
      code: data.code,
      location: data.location,
    }
  })
  return hotel
}`
);

fs.writeFileSync('backend/src/services/hotel.service.ts', service);
