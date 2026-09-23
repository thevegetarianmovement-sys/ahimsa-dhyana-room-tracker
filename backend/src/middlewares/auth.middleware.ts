import { Request, Response, NextFunction } from 'express'
import { decrypt } from '../lib/auth'

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const requireAuth = (allowedRoles: string[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const sessionCookie = req.cookies.session
    if (!sessionCookie) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      const payload = await decrypt(sessionCookie)
      req.user = payload

      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role as string)) {
        res.status(403).json({ error: 'Forbidden' })
        return
      }

      next()
    } catch (e) {
      res.status(401).json({ error: 'Invalid session' })
    }
  }
}
