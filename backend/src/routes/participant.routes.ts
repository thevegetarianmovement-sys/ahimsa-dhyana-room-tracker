import { Router } from 'express'
import * as participantController from '../controllers/participant.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

// All participant routes require ADMIN authorization
router.use(requireAuth(['ADMIN']))

router.get('/', participantController.getParticipants)
router.get('/categories', participantController.getCategories)
router.get('/:id', participantController.getParticipantById)
router.post('/', participantController.createParticipant)
router.put('/:id', participantController.updateParticipant)

export default router
