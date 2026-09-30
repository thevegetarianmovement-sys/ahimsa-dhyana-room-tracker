const fs = require('fs');
const path = 'backend/src/services/allocation.service.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix registerAndAllocate
content = content.replace(
  /const count = await prisma\.participant\.count\(\)\n\s*regNum = `ADM-\$\{1000 \+ count \+ 1\}`/,
  `regNum = \`ADM-\${Math.floor(Date.now() / 1000).toString().slice(-4)}\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\``
);

// Fix groupRegisterAndAllocate
content = content.replace(
  /const count = await prisma\.participant\.count\(\)\n\s*regNum = `ADM-\$\{1000 \+ count \+ 1 \+ i\}`/,
  `regNum = \`ADM-\${Math.floor(Date.now() / 1000).toString().slice(-4)}\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\``
);

// Fix familyBookAndAllocate
content = content.replace(
  /const startCount = await prisma\.participant\.count\(\);\n\s*for \(let i = 0; i < targetBedIds\.length; i\+\+\) \{\n\s*const bId = targetBedIds\[i\];\n\s*const regNum = `FAM-\$\{1000 \+ startCount \+ 1 \+ i\}`;/,
  `const baseId = Math.floor(Date.now() / 1000).toString().slice(-4);\n    for (let i = 0; i < targetBedIds.length; i++) {\n      const bId = targetBedIds[i];\n      const regNum = \`FAM-\${baseId}\${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}\`;`
);

fs.writeFileSync(path, content);
console.log('Fixed ID generation!');
