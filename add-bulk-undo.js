const fs = require('fs');

// 1. Service
const svcPath = 'backend/src/services/allocation.service.ts';
let svcContent = fs.readFileSync(svcPath, 'utf8');
svcContent += `
export const bulkUndoAllocations = async (allocationIds: string[]) => {
  // Hard delete allocations
  await prisma.accommodationAllocation.deleteMany({
    where: { id: { in: allocationIds } }
  });
  return { success: true, count: allocationIds.length };
};
`;
fs.writeFileSync(svcPath, svcContent);

// 2. Controller
const ctlPath = 'backend/src/controllers/allocation.controller.ts';
let ctlContent = fs.readFileSync(ctlPath, 'utf8');
ctlContent += `
export const bulkUndoAllocations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { allocationIds, locationId, type } = req.body;
    if (req.user.role === 'VOLUNTEER') {
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, locationId, type);
      if (!isAuth) {
        res.status(403).json({ error: 'Forbidden: You can only manage your assigned location' });
        return;
      }
    }
    const result = await allocationService.bulkUndoAllocations(allocationIds);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Bulk undo error:', error);
    res.status(500).json({ error: 'Failed to bulk undo allocations' });
  }
};
`;
fs.writeFileSync(ctlPath, ctlContent);

// 3. Routes
const rtsPath = 'backend/src/routes/allocation.routes.ts';
let rtsContent = fs.readFileSync(rtsPath, 'utf8');
rtsContent = rtsContent.replace(
  /export default router/,
  `router.post('/bulk-undo', requireAuth(['ADMIN', 'VOLUNTEER']), allocationController.bulkUndoAllocations)\n\nexport default router`
);
fs.writeFileSync(rtsPath, rtsContent);

console.log('Backend bulk-undo endpoint added');
