const fs = require('fs');
let content = fs.readFileSync('backend/src/routes/allocation.routes.ts', 'utf8');
content = content.replace('export default router', "router.post('/family-book', requireAuth(['ADMIN', 'VOLUNTEER']), allocationController.familyBookAndAllocate)\n\nexport default router");
fs.writeFileSync('backend/src/routes/allocation.routes.ts', content);
