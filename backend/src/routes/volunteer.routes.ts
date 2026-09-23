import { Router } from 'express'
import * as volunteerController from '../controllers/volunteer.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

// All volunteer management is ADMIN only
router.get('/', requireAuth(['ADMIN']), volunteerController.getVolunteers)
router.get('/:id', requireAuth(['ADMIN']), volunteerController.getVolunteerById)
router.post('/', requireAuth(['ADMIN']), volunteerController.createVolunteer)
router.put('/:id', requireAuth(['ADMIN']), volunteerController.updateVolunteer)
router.post('/:id/shifts', requireAuth(['ADMIN']), volunteerController.assignShift)
router.delete('/shifts/:shiftId', requireAuth(['ADMIN']), volunteerController.deleteShift)

export default router
