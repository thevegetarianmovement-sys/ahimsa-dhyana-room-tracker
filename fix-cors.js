const fs = require('fs');

let indexTs = fs.readFileSync('backend/src/index.ts', 'utf8');

// Replace CORS configuration
indexTs = indexTs.replace(
  /const allowedOrigins = \['http:\/\/localhost:3000', 'http:\/\/localhost:3001'\]\napp\.use\(cors\(\{[\s\S]*?\}\)\)/,
  `const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === frontendUrl) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))`
);

fs.writeFileSync('backend/src/index.ts', indexTs);
console.log('Fixed backend CORS');
