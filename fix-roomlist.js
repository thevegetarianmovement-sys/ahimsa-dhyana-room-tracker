const fs = require('fs');
let c = fs.readFileSync('src/components/hotels/RoomList.tsx', 'utf8');

c = c.replace(
  "import { checkOutAllocation, registerAndAllocate, groupRegisterAndAllocate } from '@/app/actions/participant'",
  "import { useRouter } from 'next/navigation'"
);

c = c.replace(
  "export default function RoomList({ rooms, hotelId }: { rooms: any[], hotelId: string }) {",
  "export default function RoomList({ rooms, hotelId }: { rooms: any[], hotelId: string }) {\n  const router = useRouter();"
);

c = c.replace(
  `    try {
      await checkOutAllocation(allocId, hotelId)
      setSelectedBed(null)
    } catch (e) {`,
  `    try {
      const res = await fetch(\`http://localhost:4000/api/allocations/\${allocId}/checkout\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locationId: hotelId })
      });
      if (!res.ok) throw new Error('Error checking out');
      setSelectedBed(null);
      router.refresh();
    } catch (e) {`
);

c = c.replace(
  `    try {
      await registerAndAllocate(regData, hotelId, selectedBed.id, 'HOTEL')
      setSelectedBed(null)
      setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '' })
    } catch (e: any) {`,
  `    try {
      const res = await fetch('http://localhost:4000/api/allocations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: regData, locationId: hotelId, bedId: selectedBed.id, type: 'HOTEL' })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error registering');
      }
      setSelectedBed(null)
      setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '' })
      router.refresh();
    } catch (e: any) {`
);

c = c.replace(
  `    try {
      await groupRegisterAndAllocate(groupData, hotelId, groupBookingRoom.id)
      setGroupBookingRoom(null)
      setGroupData([])
    } catch (e: any) {`,
  `    try {
      const res = await fetch('http://localhost:4000/api/allocations/group-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ people: groupData, locationId: hotelId, roomId: groupBookingRoom.id })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error group registering');
      }
      setGroupBookingRoom(null)
      setGroupData([])
      router.refresh();
    } catch (e: any) {`
);

fs.writeFileSync('src/components/hotels/RoomList.tsx', c);
