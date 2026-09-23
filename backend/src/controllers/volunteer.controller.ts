import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import * as volunteerService from '../services/volunteer.service'

export const getVolunteers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vols = await volunteerService.getVolunteers()
    res.json(vols)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteers' })
  }
}

export const getVolunteerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vol = await volunteerService.getVolunteerById(req.params.id as string)
    if (!vol) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(vol)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volunteer' })
  }
}

export const createVolunteer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vol = await volunteerService.createVolunteer(req.body)
    res.status(201).json(vol)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create volunteer' })
  }
}

export const updateVolunteer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vol = await volunteerService.updateVolunteer(req.params.id as string, req.body)
    res.json(vol)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update volunteer' })
  }
}

export const assignShift = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const shift = await volunteerService.assignShift(req.params.id as string, req.body)
    res.status(201).json(shift)
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign shift' })
  }
}

export const deleteShift = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await volunteerService.deleteShift(req.params.shiftId as string)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shift' })
  }
}

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
