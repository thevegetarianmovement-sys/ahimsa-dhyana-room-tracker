import { Request, Response } from 'express'
import * as participantService from '../services/participant.service'

export const getParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || ''
    const status = (req.query.status as string) || ''
    const participants = await participantService.getParticipants(q, status)
    res.json(participants)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' })
  }
}

export const getParticipantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const participant = await participantService.getParticipantById(String(String((req.params.id as string))) as string)
    if (!participant) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(participant)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participant' })
  }
}

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await participantService.getCategories()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

export const createParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const participant = await participantService.createParticipant(req.body)
    res.status(201).json(participant)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create participant' })
  }
}

export const updateParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const participant = await participantService.updateParticipant((req.params.id as string) as string, req.body)
    res.json(participant)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update participant' })
  }
}

export const bulkCreateParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await participantService.bulkCreateParticipants(req.body.participants)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk import participants' })
  }
}

export const deleteParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    await participantService.deleteParticipant((req.params.id as string));
    res.json({ message: 'Participant deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to delete participant' });
  }
}
