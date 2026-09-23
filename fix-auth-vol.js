const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/auth.controller.ts', 'utf8');

const newMethod = `
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

  const sessionData = { 
    id: \`vol-\${Date.now()}\`, 
    username: name.trim(), 
    role: 'VOLUNTEER',
    locationType,
    locationId
  };
  const encryptedSessionData = await encrypt(sessionData);

  res.cookie('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 14 * 60 * 60 * 1000, // 14 hours for a shift
    path: '/',
  });

  res.status(200).json({ success: true });
}
`;

c += newMethod;
fs.writeFileSync('backend/src/controllers/auth.controller.ts', c);
