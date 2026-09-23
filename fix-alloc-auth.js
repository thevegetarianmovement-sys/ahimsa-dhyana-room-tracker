const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/allocation.controller.ts', 'utf8');

c = `import { isVolunteerAuthorizedForLocation } from '../lib/volunteerAuth'\n` + c;

c = c.replace(
  /if \(req\.user\.role === 'VOLUNTEER' && req\.user\.locationId !== locationId\) {/g,
  `if (req.user.role === 'VOLUNTEER') {
      // Determine type based on context, since the endpoint might serve both Hotels and Shads.
      // Wait, locationType isn't explicitly passed to checkout in some cases, but type is for register.
      // Let's rely on req.user.locationType from the JWT just for the type, 
      // but verify the actual assignment in the DB for that locationId!
      const isAuth = await isVolunteerAuthorizedForLocation(req.user.id, locationId, req.user.locationType as 'HOTEL' | 'SHAD');
      if (!isAuth) {`
);

fs.writeFileSync('backend/src/controllers/allocation.controller.ts', c);
