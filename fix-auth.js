const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/auth.controller.ts', 'utf8');

// Replace the old volunteerLogin with the new one
c = c.replace(
  /export const volunteerLogin = async \([\s\S]*?res\.status\(200\)\.json\(\{ success: true \}\);\n\}/,
  `export const volunteerLogin = async (req: Request, res: Response): Promise<void> => {
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
    sameSite: 'lax',
    maxAge: 14 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(200).json({ success: true });
}`
);

fs.writeFileSync('backend/src/controllers/auth.controller.ts', c);
