import { isVolunteerAuthorizedForLocation } from '../lib/volunteerAuth'
import { Request, Response } from 'express'
import * as hotelService from '../services/hotel.service'

export const getHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotels = await hotelService.getHotels()
    res.json(hotels)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotels' })
  }
}

export const getHotelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.getHotelById(req.params.id as string)
    if (!hotel) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json(hotel)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel' })
  }
}

export const createHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.createHotel(req.body)
    res.status(201).json(hotel)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hotel' })
  }
}

export const updateHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = await hotelService.updateHotel(req.params.id as string, req.body)
    res.json(hotel)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hotel' })
  }
}

export const addRoomToHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    await hotelService.addRoomToHotel(req.params.id as string, req.body)
    res.status(201).json({ success: true })
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to add room' })
  }
}

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    await hotelService.deleteRoom(req.params.roomId as string)
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' })
  }
}
