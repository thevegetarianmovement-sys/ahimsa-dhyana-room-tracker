const fs = require('fs');

// 1. Backend Service
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

// 2. Frontend Form
let form = fs.readFileSync('src/components/hotels/HotelForm.tsx', 'utf8');
// Remove from JSON payload
form = form.replace(
  /numRooms: parseInt\(formData\.get\('numRooms'\) as string, 10\),\n\s*bedsPerRoom: parseInt\(formData\.get\('bedsPerRoom'\) as string, 10\)/,
  ""
);
// Clean up trailing comma if needed (the regex above assumes it was at the end without a trailing comma, wait, let me check the actual file to be safe)
