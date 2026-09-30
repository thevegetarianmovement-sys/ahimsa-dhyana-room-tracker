const fs = require('fs');
const path = 'src/components/hotels/RoomList.tsx';
let content = fs.readFileSync(path, 'utf8');

const selectRoomBtn = `
                  {undoMode && room.beds.some((b: any) => b.allocations.length > 0) && (
                    <button 
                      onClick={() => {
                        const occIds = room.beds.filter((b: any) => b.allocations.length > 0).map((b: any) => b.allocations[0].id)
                        const allSelected = occIds.every((id: string) => undoCart.includes(id))
                        if (allSelected) {
                          setUndoCart(undoCart.filter(id => !occIds.includes(id)))
                        } else {
                          setUndoCart([...new Set([...undoCart, ...occIds])])
                        }
                      }}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold hover:bg-red-200 transition-colors ml-2"
                    >
                      {room.beds.filter((b: any) => b.allocations.length > 0).every((b: any) => undoCart.includes(b.allocations[0].id)) ? 'Deselect Room' : 'Select Room to Erase'}
                    </button>
                  )}
`;

content = content.replace(
  /\{room\.capacity\} Beds\n\s*<\/span>\n\s*<\/div>/,
  `{room.capacity} Beds\n                    </span>\n${selectRoomBtn}\n                  </div>`
);

fs.writeFileSync(path, content);
console.log('Added Select Room button to undo mode');
