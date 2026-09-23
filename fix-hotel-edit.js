const fs = require('fs');
let c = fs.readFileSync('src/components/hotels/HotelEditForm.tsx', 'utf8');

c = c.replace("import { updateHotel } from '@/app/actions/hotel'", "import { useRouter } from 'next/navigation'");
c = c.replace(`      await updateHotel(hotel.id, {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        location: formData.get('location') as string,
      })`, `      const res = await fetch(\`http://localhost:4000/api/hotels/\${hotel.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name') as string,
          code: formData.get('code') as string,
          location: formData.get('location') as string,
        })
      })
      if (!res.ok) throw new Error('Error updating hotel')
      require('next/navigation').useRouter().refresh()`);

fs.writeFileSync('src/components/hotels/HotelEditForm.tsx', c);
