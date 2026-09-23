const fs = require('fs');
let c = fs.readFileSync('src/components/participants/AllocationForm.tsx', 'utf8');

c = c.replace(
  "import { allocateAccommodation } from '@/app/actions/participant'",
  "import { useRouter } from 'next/navigation'"
);
c = c.replace(
  "const [selectedRoom, setSelectedRoom] = useState('')",
  "const [selectedRoom, setSelectedRoom] = useState('')\n  const router = useRouter()"
);
c = c.replace(
  "await allocateAccommodation(participantId, data)",
  `const res = await fetch('http://localhost:4000/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId, data })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to allocate accommodation');
      }
      router.refresh();`
);
fs.writeFileSync('src/components/participants/AllocationForm.tsx', c);
