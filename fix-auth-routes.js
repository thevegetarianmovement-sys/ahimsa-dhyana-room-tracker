const fs = require('fs');
let c = fs.readFileSync('backend/src/routes/auth.routes.ts', 'utf8');
c = c.replace(
  "import { login, logout, getSession } from '../controllers/auth.controller'",
  "import { login, logout, getSession, volunteerLogin } from '../controllers/auth.controller'"
);
c += "\nrouter.post('/volunteer-login', volunteerLogin)\n";
fs.writeFileSync('backend/src/routes/auth.routes.ts', c);
