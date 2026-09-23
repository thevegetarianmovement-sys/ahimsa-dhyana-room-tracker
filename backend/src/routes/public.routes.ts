
import { Router } from 'express'
import * as publicController from '../controllers/public.controller'

const router = Router()
router.get('/locations', publicController.getPublicLocations)
export default router
