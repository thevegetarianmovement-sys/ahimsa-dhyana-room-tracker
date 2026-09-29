const fs = require('fs');

// 1. Hotel Service Delete
let hotelService = fs.readFileSync('backend/src/services/hotel.service.ts', 'utf8');
hotelService += `
export const deleteHotel = async (id: string) => {
  // Find all beds in this hotel
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { rooms: { include: { beds: true } } }
  });
  if (!hotel) throw new Error('Hotel not found');

  const bedIds = hotel.rooms.flatMap(r => r.beds.map(b => b.id));
  
  // Delete all allocations tied to these beds
  await prisma.accommodationAllocation.deleteMany({
    where: { bedId: { in: bedIds } }
  });

  // Now delete the hotel (rooms and beds cascade)
  return await prisma.hotel.delete({ where: { id } });
}
`;
fs.writeFileSync('backend/src/services/hotel.service.ts', hotelService);

// 2. Hotel Controller Delete
let hotelController = fs.readFileSync('backend/src/controllers/hotel.controller.ts', 'utf8');
hotelController += `
export const deleteHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    await hotelService.deleteHotel(req.params.id);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete hotel' });
  }
}
`;
fs.writeFileSync('backend/src/controllers/hotel.controller.ts', hotelController);

// 3. Hotel Routes Delete
let hotelRoutes = fs.readFileSync('backend/src/routes/hotel.routes.ts', 'utf8');
hotelRoutes = hotelRoutes.replace(
  'export default router',
  "router.delete('/:id', requireAuth(['ADMIN']), hotelController.deleteHotel)\n\nexport default router"
);
fs.writeFileSync('backend/src/routes/hotel.routes.ts', hotelRoutes);


// 4. Participant Service Delete
let participantService = fs.readFileSync('backend/src/services/participant.service.ts', 'utf8');
participantService += `
export const deleteParticipant = async (id: string) => {
  // Delete allocations first
  await prisma.accommodationAllocation.deleteMany({
    where: { participantId: id }
  });
  
  return await prisma.participant.delete({ where: { id } });
}
`;
fs.writeFileSync('backend/src/services/participant.service.ts', participantService);

// 5. Participant Controller Delete
let participantController = fs.readFileSync('backend/src/controllers/participant.controller.ts', 'utf8');
participantController += `
export const deleteParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    await participantService.deleteParticipant(req.params.id);
    res.json({ message: 'Participant deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete participant' });
  }
}
`;
fs.writeFileSync('backend/src/controllers/participant.controller.ts', participantController);

// 6. Participant Routes Delete
let participantRoutes = fs.readFileSync('backend/src/routes/participant.routes.ts', 'utf8');
participantRoutes = participantRoutes.replace(
  'export default router',
  "router.delete('/:id', requireAuth(['ADMIN']), participantController.deleteParticipant)\n\nexport default router"
);
fs.writeFileSync('backend/src/routes/participant.routes.ts', participantRoutes);

