import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import * as allocationService from '../services/allocation.service'
import { isVolunteerAuthorizedForLocation } from '../lib/volunteerAuth'

export const allocateAccommodation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { participantId, data } = req.body
    const alloc = await allocationService.allocateAccommodation(participantId, data)
    res.status(201).json(alloc)
  } catch (error: any) {
    if (error.message.includes('already booked')) {
      res.status(409).json({ error: error.message })
    } else {
      res.status(400).json({ error: error.message || 'Failed to allocate accommodation' })
    }
  }
}

export const cancelAllocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await allocationService.cancelAllocation(id as string)
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to cancel allocation' })
  }
}

export const checkOutAllocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { locationId } = req.body
    
    if (req.user.role === 'VOLUNTEER') {
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, locationId, req.user.locationType as 'HOTEL' | 'SHAD')
      if (!isAuth) {
        res.status(403).json({ error: 'Forbidden: You can only manage your assigned location' })
        return
      }
    }

    await allocationService.checkOutAllocation(id as string)
    res.status(200).json({ success: true })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to checkout allocation' })
  }
}

export const registerAndAllocate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data, locationId, bedId, type } = req.body

    if (req.user.role === 'VOLUNTEER') {
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, locationId, type)
      if (!isAuth) {
        res.status(403).json({ error: 'Forbidden: You can only assign beds in your assigned location' })
        return
      }
    }

    const alloc = await allocationService.registerAndAllocate(data, locationId, bedId, type)
    res.status(201).json(alloc)
  } catch (error: any) {
    if (error.message.includes('booked by someone else')) {
      res.status(409).json({ error: error.message })
    } else {
      res.status(400).json({ error: error.message || 'Failed to register and allocate' })
    }
  }
}

export const groupRegisterAndAllocate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { people, locationId, roomId } = req.body

    if (req.user.role === 'VOLUNTEER') {
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, locationId, req.user.locationType as 'HOTEL' | 'SHAD')
      if (!isAuth) {
        res.status(403).json({ error: 'Forbidden: You can only assign beds in your assigned location' })
        return
      }
    }

    const allocs = await allocationService.groupRegisterAndAllocate(people, locationId, roomId)
    res.status(201).json(allocs)
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to group register and allocate' })
  }
}
