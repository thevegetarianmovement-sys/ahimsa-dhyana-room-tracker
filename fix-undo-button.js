const fs = require('fs');
const path = 'src/components/hotels/RoomList.tsx';
let content = fs.readFileSync(path, 'utf8');

const undoButton = `
              <button 
                onClick={() => {
                  setUndoMode(!undoMode);
                  if (!undoMode) { setFamilyMode(false); setFamilyCart([]); }
                  setUndoCart([]);
                }}
                className={\`flex-1 px-4 py-2 rounded shadow text-sm font-bold \${undoMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}\`}
              >
                {undoMode ? 'Cancel Undo Mode' : 'Mistake? Bulk Undo'}
              </button>
`;

// Insert the button before Auto-Assign Family
content = content.replace(
  /<button \s*onClick=\{\(\) => setAutoFamilyModal\(true\)\}/,
  `${undoButton.trim()}\n              <button \n                onClick={() => setAutoFamilyModal(true)}`
);

fs.writeFileSync(path, content);
console.log('Injected Undo Button successfully!');
