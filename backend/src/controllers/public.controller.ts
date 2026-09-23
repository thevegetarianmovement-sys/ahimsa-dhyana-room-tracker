
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getPublicLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } })
    const shads = await prisma.shad.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, code: true } })
    res.json({ hotels, shads })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public locations' })
  }
}
