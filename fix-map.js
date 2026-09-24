const fs = require('fs');

function fixMap(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /map\(\(\) => \(\{ name: '', phone: '', registrationNumber: '', checkOutDate: '' \}\)\)/g,
    "map(() => ({ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' }))"
  );
  fs.writeFileSync(file, content);
}

fixMap('src/components/hotels/RoomList.tsx');
fixMap('src/components/shads/ShadBedList.tsx');
