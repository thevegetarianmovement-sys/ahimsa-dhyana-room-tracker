import { Router } from 'express'
import * as allocationController from '../controllers/allocation.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()

// allocateAccommodation requires ADMIN
router.post('/', requireAuth(['ADMIN']), allocationController.allocateAccommodation)

// cancelAllocation requires ADMIN
router.put('/:id/cancel', requireAuth(['ADMIN']), allocationController.cancelAllocation)

// checkOutAllocation requires ADMIN or VOLUNTEER
router.put('/:id/checkout', requireAuth(['ADMIN', 'VOLUNTEER']), allocationController.checkOutAllocation)

// registerAndAllocate requires ADMIN or VOLUNTEER
router.post('/register', requireAuth(['ADMIN', 'VOLUNTEER']), allocationController.registerAndAllocate)

// groupRegisterAndAllocate requires ADMIN or VOLUNTEER
router.post('/group-register', requireAuth(['ADMIN', 'VOLUNTEER']), allocationController.groupRegisterAndAllocate)

export default router
