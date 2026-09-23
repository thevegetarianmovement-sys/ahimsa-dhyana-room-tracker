import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/db'
import { encrypt, decrypt } from '../lib/auth'

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body
  
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials or inactive account.' })
      return
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials.' })
      return
    }

    const sessionData = { id: user.id, username: user.username, role: user.role }
    const encryptedSessionData = await encrypt(sessionData)

    res.cookie('session', encryptedSessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
      path: '/',
    })

    res.status(200).json({ success: true, role: user.role })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('session', { path: '/' })
  res.status(200).json({ success: true })
}

export const getSession = async (req: Request, res: Response): Promise<void> => {
  const sessionCookie = req.cookies.session
  if (!sessionCookie) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    const payload = await decrypt(sessionCookie)
    res.status(200).json({ user: payload })
  } catch (e) {
    res.status(401).json({ error: 'Invalid session' })
  }
}

export const volunteerLogin = async (req: Request, res: Response): Promise<void> => {
  const { passcode, name, locationType, locationId } = req.body;
  
  const masterPasscode = process.env.VOLUNTEER_PASSCODE || 'JALSA2026';
  if (passcode !== masterPasscode) {
    res.status(401).json({ error: 'Invalid Passcode' });
    return;
  }
  
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  
  if (!locationType || !locationId) {
    res.status(400).json({ error: 'Location is required' });
    return;
  }

  // Verify volunteer exists and is active
  const volunteer = await prisma.volunteer.findFirst({
    where: { name: name.trim() }
  });

  if (!volunteer) {
    res.status(401).json({ error: 'Volunteer not found' });
    return;
  }

  if (!volunteer.isActive) {
    res.status(401).json({ error: 'Inactive volunteer cannot login' });
    return;
  }

  // Wait, should we verify they have a shift RIGHT NOW during login?
  // The prompt says "valid volunteer can login". It doesn't strictly say login fails if not on shift, 
  // but it does say "Those values may remain temporarily for UI/session convenience".
  // Let's just issue the session with their REAL id.

  const sessionData = { 
    id: volunteer.id, // REAL ID from DB
    username: volunteer.name, 
    role: 'VOLUNTEER',
    locationType,
    locationId
  };
  const encryptedSessionData = await encrypt(sessionData);

  res.cookie('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 14 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(200).json({ success: true });
}
