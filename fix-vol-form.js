const fs = require('fs');
let c = fs.readFileSync('src/components/volunteers/VolunteerForm.tsx', 'utf8');

c = c.replace(
  "import { createVolunteer, updateVolunteer } from '@/app/actions/volunteer'",
  ""
);

c = c.replace(
  `      if (isEditing) {
        await updateVolunteer(initialData.id, data)
        router.refresh()
        alert('Saved successfully')
      } else {
        await createVolunteer(data)
        router.push('/volunteers')
      }`,
  `      if (isEditing) {
        const res = await fetch('http://localhost:4000/api/volunteers/' + initialData.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update');
        router.refresh()
        alert('Saved successfully')
      } else {
        const res = await fetch('http://localhost:4000/api/volunteers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create');
        router.push('/volunteers')
      }`
);

fs.writeFileSync('src/components/volunteers/VolunteerForm.tsx', c);
