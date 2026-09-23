const fs = require('fs');

const fixFile = (path) => {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(
      /alloc\.checkOutDate\.toISOString\(\)/g,
      'new Date(alloc.checkOutDate).toISOString()'
    );
    // Also fix any potential checkInDate issues
    content = content.replace(
      /alloc\.checkInDate\.toISOString\(\)/g,
      'new Date(alloc.checkInDate).toISOString()'
    );
    fs.writeFileSync(path, content);
    console.log(`Fixed ${path}`);
  }
};

fixFile('src/app/hotels/[id]/page.tsx');
fixFile('src/app/shads/[id]/page.tsx');
fixFile('src/app/dashboard/page.tsx');
fixFile('src/components/hotels/RoomList.tsx');
fixFile('src/components/shads/ShadBedList.tsx');
