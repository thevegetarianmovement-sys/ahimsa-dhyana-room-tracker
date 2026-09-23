const fs = require('fs');

// 1. Add to volunteer.service.ts
let service = fs.readFileSync('backend/src/services/volunteer.service.ts', 'utf8');
service += `
export const getOnDutyShifts = async (locationId: string, type: 'HOTEL' | 'SHAD') => {
  const today = new Date()
  today.setHours(0,0,0,0)
  return await prisma.volunteerShift.findMany({
    where: {
      [type === 'HOTEL' ? 'hotelId' : 'shadId']: locationId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: { volunteer: true }
  })
}
`;
fs.writeFileSync('backend/src/services/volunteer.service.ts', service);

// 2. Add to volunteer.controller.ts
let controller = fs.readFileSync('backend/src/controllers/volunteer.controller.ts', 'utf8');
controller += `
export const getOnDutyShifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const locationId = req.query.locationId as string
    const type = req.query.type as 'HOTEL' | 'SHAD'
    const shifts = await volunteerService.getOnDutyShifts(locationId, type)
    res.json(shifts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch on duty shifts' })
  }
}
`;
fs.writeFileSync('backend/src/controllers/volunteer.controller.ts', controller);

// 3. Add to volunteer.routes.ts
let route = fs.readFileSync('backend/src/routes/volunteer.routes.ts', 'utf8');
route = route.replace(
  /router\.get\('\/', requireAuth\(\['ADMIN', 'VOLUNTEER'\]\), volunteerController\.getVolunteers\)/,
  `router.get('/', requireAuth(['ADMIN', 'VOLUNTEER']), volunteerController.getVolunteers)
router.get('/on-duty', requireAuth(['ADMIN', 'VOLUNTEER']), volunteerController.getOnDutyShifts)`
);
fs.writeFileSync('backend/src/routes/volunteer.routes.ts', route);

// 4. Update frontend volunteer/hotels/[id]/page.tsx
let hotelPage = fs.readFileSync('src/app/volunteer/hotels/[id]/page.tsx', 'utf8');
hotelPage = hotelPage.replace(
  /const onDuty = await prisma\.volunteerShift\.findMany\(\{[\s\S]*?include: \{ volunteer: true \}\r?\n\s*\}\)/,
  `const onDutyRes = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/volunteers/on-duty?locationId=\${hotel.id}&type=HOTEL\`, { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' });
  let onDuty = onDutyRes.ok ? await onDutyRes.json() : [];
  onDuty = onDuty.filter((s: any) => s.shiftName === currentShiftName);`
);
fs.writeFileSync('src/app/volunteer/hotels/[id]/page.tsx', hotelPage);

// 5. Update frontend volunteer/shads/[id]/page.tsx
let shadPage = fs.readFileSync('src/app/volunteer/shads/[id]/page.tsx', 'utf8');
shadPage = shadPage.replace(
  /const onDuty = await prisma\.volunteerShift\.findMany\(\{[\s\S]*?include: \{ volunteer: true \}\r?\n\s*\}\)/,
  `const onDutyRes = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/volunteers/on-duty?locationId=\${shad.id}&type=SHAD\`, { headers: { Cookie: \`session=\${sessionCookie}\` }, cache: 'no-store' });
  let onDuty = onDutyRes.ok ? await onDutyRes.json() : [];
  onDuty = onDuty.filter((s: any) => s.shiftName === currentShiftName);`
);
fs.writeFileSync('src/app/volunteer/shads/[id]/page.tsx', shadPage);
