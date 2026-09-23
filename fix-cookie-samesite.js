const fs = require('fs');
let content = fs.readFileSync('backend/src/controllers/auth.controller.ts', 'utf8');
content = content.replace(/sameSite: 'lax',/g, "sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',");
fs.writeFileSync('backend/src/controllers/auth.controller.ts', content);
