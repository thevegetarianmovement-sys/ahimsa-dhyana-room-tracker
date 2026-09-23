const fs = require('fs');
let c = fs.readFileSync('src/components/hotels/HotelForm.tsx', 'utf8');

c = c.replace("import { createHotel } from '@/app/actions/hotel'", "");
c = c.replace(`      await createHotel({
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        location: formData.get('location') as string,
        numRooms: parseInt(formData.get('numRooms') as string, 10),
        bedsPerRoom: parseInt(formData.get('bedsPerRoom') as string, 10)
      })`, `      const res = await fetch('http://localhost:4000/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          location: formData.get('location') as string,
          numRooms: parseInt(formData.get('numRooms') as string, 10),
          bedsPerRoom: parseInt(formData.get('bedsPerRoom') as string, 10)
        })
      })
      if (!res.ok) throw new Error('Error creating hotel')`);

fs.writeFileSync('src/components/hotels/HotelForm.tsx', c);
