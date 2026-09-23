const fs = require('fs');

// 1. Create public endpoint in backend controller
let pubController = `
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getPublicLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true, location: true } })
    const shads = await prisma.shad.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true, location: true } })
    res.json({ hotels, shads })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public locations' })
  }
}
`;
fs.writeFileSync('backend/src/controllers/public.controller.ts', pubController);

// 2. Add route
let indexRoutes = fs.readFileSync('backend/src/index.ts', 'utf8');
indexRoutes = indexRoutes.replace(
  /import authRoutes from '\.\/routes\/auth\.routes'/,
  `import authRoutes from './routes/auth.routes'\nimport publicRoutes from './routes/public.routes'`
);
indexRoutes = indexRoutes.replace(
  /app\.use\('\/api\/auth', authRoutes\)/,
  `app.use('/api/auth', authRoutes)\napp.use('/api/public', publicRoutes)`
);
fs.writeFileSync('backend/src/index.ts', indexRoutes);

let pubRoutes = `
import { Router } from 'express'
import * as publicController from '../controllers/public.controller'

const router = Router()
router.get('/locations', publicController.getPublicLocations)
export default router
`;
fs.writeFileSync('backend/src/routes/public.routes.ts', pubRoutes);

// 3. Update frontend login page
let loginPage = fs.readFileSync('src/app/volunteer/login/page.tsx', 'utf8');
loginPage = loginPage.replace(/import prisma from ['"]@\/lib\/db['"]\r?\n/, '');
loginPage = loginPage.replace(
  /const hotels = await prisma\.hotel\.findMany\(\{ orderBy: \{ name: 'asc' \} \}\)\r?\n\s*const shads = await prisma\.shad\.findMany\(\{ orderBy: \{ name: 'asc' \} \}\)/,
  `const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/public/locations\`, { cache: 'no-store' });
  const data = res.ok ? await res.json() : { hotels: [], shads: [] };
  const hotels = data.hotels;
  const shads = data.shads;`
);
fs.writeFileSync('src/app/volunteer/login/page.tsx', loginPage);
