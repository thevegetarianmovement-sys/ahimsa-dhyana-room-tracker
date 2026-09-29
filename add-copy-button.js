const fs = require('fs');

function addCopyButton(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We want to insert the button next to <h4 className="font-bold text-slate-700 mb-3">Bed {idx + 1}</h4>
  
  const searchStr = `<h4 className="font-bold text-slate-700 mb-3">Bed {idx + 1}</h4>`;
  const replaceStr = `<div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-700">Bed {idx + 1}</h4>
                      {idx === 0 && groupData.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const nd = [...groupData];
                            const first = nd[0];
                            for(let i=1; i<nd.length; i++) {
                              nd[i] = { ...first, name: first.name ? first.name + (i > 0 ? ' (Guest ' + i + ')' : '') : '' };
                            }
                            setGroupData(nd);
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200 transition-colors"
                        >
                          Copy details to all beds
                        </button>
                      )}
                    </div>`;

  if(!content.includes('Copy details to all beds')) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content);
  }
}

addCopyButton('src/components/hotels/RoomList.tsx');
addCopyButton('src/components/shads/ShadBedList.tsx');
