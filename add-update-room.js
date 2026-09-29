const fs = require('fs');

// 1. Routes
let routes = fs.readFileSync('backend/src/routes/hotel.routes.ts', 'utf8');
if (!routes.includes('updateRoom')) {
  routes = routes.replace(
    /router\.delete\('\/rooms\/:roomId', requireAuth\(\['ADMIN'\]\), hotelController\.deleteRoom\)/g,
    "router.put('/rooms/:roomId', requireAuth(['ADMIN']), hotelController.updateRoom)\nrouter.delete('/rooms/:roomId', requireAuth(['ADMIN']), hotelController.deleteRoom)"
  );
  fs.writeFileSync('backend/src/routes/hotel.routes.ts', routes);
}

// 2. Controller
let controller = fs.readFileSync('backend/src/controllers/hotel.controller.ts', 'utf8');
if (!controller.includes('updateRoom = async')) {
  const updateRoomLogic = `
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { number } = req.body;
    const room = await hotelService.updateRoom(req.params.roomId as string, number);
    res.status(200).json(room);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update room' });
  }
}
`;
  controller = controller.replace(
    /export const deleteRoom = async /g,
    updateRoomLogic + '\nexport const deleteRoom = async '
  );
  fs.writeFileSync('backend/src/controllers/hotel.controller.ts', controller);
}

// 3. Service
let service = fs.readFileSync('backend/src/services/hotel.service.ts', 'utf8');
if (!service.includes('updateRoom = async')) {
  const updateRoomService = `
export const updateRoom = async (roomId: string, number: string) => {
  const existing = await prisma.room.findFirst({
    where: { 
      number,
      hotelId: (await prisma.room.findUnique({ where: { id: roomId } }))?.hotelId
    }
  });
  if (existing && existing.id !== roomId) {
    throw new Error('A room with this name already exists in this hotel.');
  }

  return await prisma.room.update({
    where: { id: roomId },
    data: { number }
  });
}
`;
  service = service.replace(
    /export const deleteRoom = async /g,
    updateRoomService + '\nexport const deleteRoom = async '
  );
  fs.writeFileSync('backend/src/services/hotel.service.ts', service);
}

console.log('Backend updateRoom implemented');
