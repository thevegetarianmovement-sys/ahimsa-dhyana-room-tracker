const fs = require('fs');
let content = fs.readFileSync('backend/src/controllers/volunteer.controller.ts', 'utf8');
content = content.replace(/import \{ Response \} from 'express'/, "import { Request, Response } from 'express'");
fs.writeFileSync('backend/src/controllers/volunteer.controller.ts', content);
