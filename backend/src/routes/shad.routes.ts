import { Router } from 'express'
import * as shadController from '../controllers/shad.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', requireAuth(), shadController.getShads)
router.get('/:id', requireAuth(), shadController.getShadById)

router.post('/', requireAuth(['ADMIN']), shadController.createShad)
router.put('/:id', requireAuth(['ADMIN']), shadController.updateShad)

export default router
