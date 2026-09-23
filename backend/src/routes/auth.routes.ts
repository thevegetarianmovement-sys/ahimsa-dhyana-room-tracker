import { Router } from 'express'
import { login, logout, getSession, volunteerLogin } from '../controllers/auth.controller'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/session', getSession)
router.get('/me', getSession)

export default router

router.post('/volunteer-login', volunteerLogin)
