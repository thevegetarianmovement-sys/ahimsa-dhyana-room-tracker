const fs = require('fs');

function fixGroupClose(path) {
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(
    /<button \s*onClick=\{\(\) => \{ setGroupBookingRoom\(null\); setGroupData\(\[\]\); \}\}\s*className="absolute top-4 right-4[^>]+>[\s\S]*?<\/button>/g,
    `<button onClick={() => { setGroupBookingRoom(null); setGroupData([]); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold shadow-sm">X</button>`
  );

  fs.writeFileSync(path, content);
}

fixGroupClose('src/components/hotels/RoomList.tsx');
fixGroupClose('src/components/shads/ShadBedList.tsx');
console.log('Fixed group close button');
