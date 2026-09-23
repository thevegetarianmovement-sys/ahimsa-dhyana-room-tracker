const fs = require('fs');
let c = fs.readFileSync('src/components/hotels/RoomForm.tsx', 'utf8');

c = c.replace(
  "import { addRoomToHotel } from '@/app/actions/hotel'",
  "import { useRouter } from 'next/navigation'"
);

c = c.replace(
  `    try {
      await addRoomToHotel(hotelId, {
        number: formData.get('number') as string,
        capacity: parseInt(formData.get('capacity') as string, 10)
      })
      form.reset()`,
  `    const router = require('next/navigation').useRouter()
    
    try {
      const res = await fetch(\`http://localhost:4000/api/hotels/\${hotelId}/rooms\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          number: formData.get('number') as string,
          capacity: parseInt(formData.get('capacity') as string, 10)
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to add room')
      }
      
      form.reset()
      window.location.reload()`
);

fs.writeFileSync('src/components/hotels/RoomForm.tsx', c);
