const fs = require('fs');
let c = fs.readFileSync('src/components/shads/ShadBedList.tsx', 'utf8');

c = c.replace(
  "import { checkOutAllocation, registerAndAllocate } from '@/app/actions/participant'",
  "import { useRouter } from 'next/navigation'"
);

c = c.replace(
  "export default function ShadBedList({ beds, shadId }: { beds: any[], shadId: string }) {",
  "export default function ShadBedList({ beds, shadId }: { beds: any[], shadId: string }) {\n  const router = useRouter();"
);

c = c.replace(
  `    try {
      await checkOutAllocation(allocId, shadId)
      setSelectedBed(null)
    } catch (e) {`,
  `    try {
      const res = await fetch(\`http://localhost:4000/api/allocations/\${allocId}/checkout\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ locationId: shadId })
      });
      if (!res.ok) throw new Error('Error checking out');
      setSelectedBed(null);
      router.refresh();
    } catch (e) {`
);

c = c.replace(
  `    try {
      await registerAndAllocate(regData, shadId, selectedBed.id, 'SHAD')
      setSelectedBed(null)
      setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '' })
    } catch (e: any) {`,
  `    try {
      const res = await fetch('http://localhost:4000/api/allocations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: regData, locationId: shadId, bedId: selectedBed.id, type: 'SHAD' })
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

fs.writeFileSync('src/components/shads/ShadBedList.tsx', c);
