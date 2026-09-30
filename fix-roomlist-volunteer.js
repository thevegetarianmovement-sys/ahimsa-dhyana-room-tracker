const fs = require('fs');

function fixRoomList(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Update signature
  content = content.replace(
    /export default function RoomList\(\{ rooms, hotelId, hotel \}: \{ rooms: any\[\], hotelId: string, hotel: any \}\) \{/g,
    'export default function RoomList({ rooms, hotelId, hotel, isVolunteer = false }: { rooms: any[], hotelId: string, hotel: any, isVolunteer?: boolean }) {'
  );

  // Hide edit room button
  content = content.replace(
    /<button onClick=\{\(\) => editRoomName\(room.id, room.number\)\} className="text-slate-400 hover:text-indigo-600" title="Edit Room Name">/g,
    '{!isVolunteer && <button onClick={() => editRoomName(room.id, room.number)} className="text-slate-400 hover:text-indigo-600" title="Edit Room Name">'
  );
  content = content.replace(
    /<\/svg>\s*<\/button>/g,
    '</svg>\n                      </button>}'
  );

  // Hide delete room button
  content = content.replace(
    /<DeleteRoomButton roomId=\{room\.id\} hotelId=\{hotelId\} disabled=\{!canDelete\} \/>/g,
    '{!isVolunteer && <DeleteRoomButton roomId={room.id} hotelId={hotelId} disabled={!canDelete} />}'
  );

  fs.writeFileSync(path, content);
}

fixRoomList('src/components/hotels/RoomList.tsx');
console.log('RoomList updated with isVolunteer prop');
