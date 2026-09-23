const fs = require('fs');

// HOTEL
let h = fs.readFileSync('backend/src/controllers/hotel.controller.ts', 'utf8');
h = `import { isVolunteerAuthorizedForLocation } from '../lib/volunteerAuth'\n` + h;
h = h.replace(
  `export const getHotelById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.getHotelById(req.params.id as string)
    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' })
      return
    }`,
  `export const getHotelById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === 'VOLUNTEER') {
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, req.params.id as string, 'HOTEL');
      if (!isAuth) {
        res.status(403).json({ error: 'Forbidden: You are not assigned to this hotel right now' });
        return;
      }
    }
    const hotel = await hotelService.getHotelById(req.params.id as string)
    if (!hotel) {
      res.status(404).json({ error: 'Hotel not found' })
      return
    }`
);
fs.writeFileSync('backend/src/controllers/hotel.controller.ts', h);

// SHAD
let s = fs.readFileSync('backend/src/controllers/shad.controller.ts', 'utf8');
s = `import { isVolunteerAuthorizedForLocation } from '../lib/volunteerAuth'\n` + s;
s = s.replace(
  `export const getShadById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const shad = await shadService.getShadById(req.params.id as string)
    if (!shad) {
      res.status(404).json({ error: 'Shad not found' })
      return
    }`,
  `export const getShadById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === 'VOLUNTEER') {
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, req.params.id as string, 'SHAD');
      if (!isAuth) {
        res.status(403).json({ error: 'Forbidden: You are not assigned to this shad right now' });
        return;
      }
    }
    const shad = await shadService.getShadById(req.params.id as string)
    if (!shad) {
      res.status(404).json({ error: 'Shad not found' })
      return
    }`
);
fs.writeFileSync('backend/src/controllers/shad.controller.ts', s);
