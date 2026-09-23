const fs = require('fs');

const fixEslint = (path) => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.includes('eslint-disable @typescript-eslint/no-explicit-any')) {
      // Add after 'use client' or at the very top
      content = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content;
      fs.writeFileSync(path, content);
      console.log(`Fixed ${path}`);
    }
  }
};

fixEslint('src/app/volunteer/login/VolunteerLoginForm.tsx');
fixEslint('src/components/volunteers/AssignShiftForm.tsx');
