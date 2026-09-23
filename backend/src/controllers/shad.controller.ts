import { isVolunteerAuthorizedForLocation } from '../lib/volunteerAuth'
import { Request, Response } from 'express'
import * as shadService from '../services/shad.service'

export const getShads = async (req: Request, res: Response): Promise<void> => {
  try {
    const shads = await shadService.getShads()
    res.json(shads)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shads' })
  }
}

export const getShadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const shad = await shadService.getShadById(req.params.id as string)
    if (!shad) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(shad)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shad' })
  }
}

export const createShad = async (req: Request, res: Response): Promise<void> => {
  try {
    const shad = await shadService.createShad(req.body)
    res.status(201).json(shad)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shad' })
  }
}

export const updateShad = async (req: Request, res: Response): Promise<void> => {
  try {
    const shad = await shadService.updateShad(req.params.id as string, req.body)
    res.json(shad)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shad' })
  }
}
