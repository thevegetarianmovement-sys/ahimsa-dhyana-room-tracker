const fs = require('fs');

// 1. Service
let service = fs.readFileSync('backend/src/services/participant.service.ts', 'utf8');
service += `
export const bulkCreateParticipants = async (participants: { name: string, phone?: string, registrationNumber?: string }[]) => {
  let successCount = 0
  let skipCount = 0

  for (const p of participants) {
    if (!p.name || p.name.trim() === '') {
      skipCount++
      continue
    }

    let regNum = p.registrationNumber
    if (regNum) {
      const existing = await prisma.participant.findUnique({ where: { registrationNumber: regNum } })
      if (existing) {
        skipCount++
        continue
      }
    } else {
      const count = await prisma.participant.count()
      regNum = \`ADM-\${1000 + count + 1 + successCount}\`
    }

    await prisma.participant.create({
      data: {
        name: p.name,
        phone: p.phone || null,
        registrationNumber: regNum
      }
    })
    successCount++
  }

  return { successCount, skipCount }
}
`;
fs.writeFileSync('backend/src/services/participant.service.ts', service);

// 2. Controller
let controller = fs.readFileSync('backend/src/controllers/participant.controller.ts', 'utf8');
controller += `
export const bulkCreateParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await participantService.bulkCreateParticipants(req.body.participants)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk import participants' })
  }
}
`;
fs.writeFileSync('backend/src/controllers/participant.controller.ts', controller);

// 3. Route
let route = fs.readFileSync('backend/src/routes/participant.routes.ts', 'utf8');
route = route.replace(
  /router\.post\('\/', requireAuth\(\['ADMIN'\]\), participantController\.createParticipant\)/,
  `router.post('/', requireAuth(['ADMIN']), participantController.createParticipant)
router.post('/bulk', requireAuth(['ADMIN']), participantController.bulkCreateParticipants)`
);
fs.writeFileSync('backend/src/routes/participant.routes.ts', route);
