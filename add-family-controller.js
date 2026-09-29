const fs = require('fs');

const file = 'backend/src/controllers/allocation.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const newController = `
export const familyBookAndAllocate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data, locationId, type, bookingParams } = req.body;

    if (req.user?.role === 'VOLUNTEER') {
      if (req.user.locationId !== locationId) {
        res.status(403).json({ error: 'You can only manage allocations for your assigned location' });
        return;
      }
    }

    const allocs = await allocationService.familyBookAndAllocate(data, locationId, type, bookingParams);
    res.status(201).json(allocs);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to family register and allocate' });
  }
}
`;

content += newController;
fs.writeFileSync(file, content);
