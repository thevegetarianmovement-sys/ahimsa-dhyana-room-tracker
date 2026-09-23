const fs = require('fs');

const fixTypes = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/hotels\.forEach\(hotel =>/g, 'hotels.forEach((hotel: any) =>');
  content = content.replace(/hotel\.rooms\.forEach\(room =>/g, 'hotel.rooms.forEach((room: any) =>');
  content = content.replace(/room\.beds\.filter\(b =>/g, 'room.beds.filter((b: any) =>');
  content = content.replace(/shads\.forEach\(shad =>/g, 'shads.forEach((shad: any) =>');
  content = content.replace(/shad\.beds\.filter\(b =>/g, 'shad.beds.filter((b: any) =>');
  fs.writeFileSync(filePath, content);
};

fixTypes('src/app/dashboard/page.tsx');
fixTypes('src/app/hotels/page.tsx');
fixTypes('src/app/shads/page.tsx');
