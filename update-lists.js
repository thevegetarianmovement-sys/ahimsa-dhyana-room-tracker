const fs = require('fs');

function updateList(file) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add occupantGender variable
  content = content.replace(
    /let occupantName = ''\n(\s*)if \(bed\.allocations/g, 
    "let occupantName = ''\n$1let occupantGender = ''\n$1if (bed.allocations"
  );
  
  // 2. Set occupantGender
  content = content.replace(
    /occupantName = alloc\.participant\?\.name \|\| 'Occupied'/g,
    "occupantName = alloc.participant?.name || 'Occupied'\n                    occupantGender = alloc.participant?.gender === 'MALE' ? ' [M]' : alloc.participant?.gender === 'FEMALE' ? ' [F]' : ''"
  );

  // 3. Display Gender on Name string under the bed square
  content = content.replace(
    /\{occupantName \|\| statusLabel\}/g,
    "{occupantName ? occupantName + occupantGender : statusLabel}"
  );

  // 4. Update the popup modal occupant display to include the Gender tag elegantly
  content = content.replace(
    /<p className="text-lg font-bold text-slate-800">\{selectedBed\.allocations\[0\]\.participant\?\.name\}<\/p>/g,
    `<p className="text-lg font-bold text-slate-800">
                      {selectedBed.allocations[0].participant?.name} 
                      {selectedBed.allocations[0].participant?.gender === 'MALE' && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Male</span>}
                      {selectedBed.allocations[0].participant?.gender === 'FEMALE' && <span className="ml-2 text-sm bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">Female</span>}
                    </p>`
  );

  fs.writeFileSync(file, content);
}

updateList('src/components/hotels/RoomList.tsx');
updateList('src/components/shads/ShadBedList.tsx');
