const fs = require('fs');
const path = 'src/components/hotels/RoomList.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add state
content = content.replace(
  /const \[familyMode, setFamilyMode\] = useState\(false\);/,
  `const [familyMode, setFamilyMode] = useState(false);
  const [undoMode, setUndoMode] = useState(false);
  const [undoCart, setUndoCart] = useState<string[]>([]);`
);

// Modify handleBedClick
const newHandleBedClick = `
  const handleBedClick = (bed: any, room: any) => {
    if (undoMode) {
      if (bed.allocations.length === 0) return; // Ignore empty beds
      const allocId = bed.allocations[0].id;
      if (undoCart.includes(allocId)) {
        setUndoCart(undoCart.filter(id => id !== allocId));
      } else {
        setUndoCart([...undoCart, allocId]);
      }
    } else if (familyMode) {
      if (bed.allocations.length > 0) return; // Ignore occupied beds
      if (familyCart.includes(bed.id)) {
        setFamilyCart(familyCart.filter(id => id !== bed.id));
      } else {
        setFamilyCart([...familyCart, bed.id]);
      }
    } else {
      setSelectedBed({ ...bed, roomNumber: room ? room.number : '' });
    }
  };
`;
content = content.replace(/const handleBedClick = \([\s\S]*?setSelectedBed\(\{ \.\.\.bed, roomNumber: room \? room\.number : '' \}\);\n    \}\n  \};/, newHandleBedClick.trim());

// Add handleBulkUndo
const handleBulkUndo = `
  const handleBulkUndo = async () => {
    if (undoCart.length === 0) return;
    if (!confirm(\`Are you sure you want to completely erase \${undoCart.length} assignments? This cannot be undone.\`)) return;
    
    try {
      setRegistering(true);
      await fetch('/api/allocations/bulk-undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationIds: undoCart,
          locationId: hotelId,
          type: 'HOTEL'
        })
      });
      setUndoCart([]);
      setUndoMode(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to undo assignments');
      setRegistering(false);
    }
  };
`;
content = content.replace(/const handleCheckOut = async \(\) => \{/, `${handleBulkUndo.trim()}\n\n  const handleCheckOut = async () => {`);

// Add undo mode banner and buttons
const undoButton = `
        <button 
          onClick={() => {
            setUndoMode(!undoMode);
            if (!undoMode) { setFamilyMode(false); setFamilyCart([]); }
            setUndoCart([]);
          }}
          className={\`px-4 py-2 font-bold rounded-lg transition-colors shadow-sm \${undoMode ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}\`}
        >
          {undoMode ? 'Cancel Undo Mode' : 'Mistake? Bulk Undo'}
        </button>
`;
content = content.replace(/<button onClick=\{handleAutoFamilyModal\} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-purple-700 transition-colors">/, `${undoButton.trim()}\n        <button onClick={handleAutoFamilyModal} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-purple-700 transition-colors">`);

// Add floating Undo Bar
const undoBar = `
      {undoMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 shadow-[0_-10px_40px_rgba(220,38,38,0.3)] z-40 flex justify-between items-center transform transition-transform duration-300">
          <div className="max-w-7xl mx-auto flex w-full justify-between items-center">
            <div>
              <p className="font-bold text-lg">Undo Mode Active</p>
              <p className="text-red-100 text-sm">{undoCart.length} assignments selected to erase</p>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={() => { setUndoMode(false); setUndoCart([]); }} className="text-red-200 hover:text-white font-medium">Cancel</button>
              <button 
                onClick={handleBulkUndo}
                disabled={undoCart.length === 0 || registering}
                className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                {registering ? 'Erasing...' : \`Erase \${undoCart.length} Beds\`}
              </button>
            </div>
          </div>
        </div>
      )}
`;
content = content.replace(/\{familyMode && \(/, `${undoBar.trim()}\n\n      {familyMode && (`);

// Change bed styling in undo mode
content = content.replace(
  /const isFamilySelected = familyMode && familyCart\.includes\(bed\.id\)/g,
  `const isFamilySelected = familyMode && familyCart.includes(bed.id)
                  const isUndoSelected = undoMode && bed.allocations.length > 0 && undoCart.includes(bed.allocations[0].id)`
);

// We need to inject the style overrides for undo mode
const oldStyles = `if (isFamilySelected) {
                    statusColor = 'bg-indigo-600 border-indigo-700 scale-105 shadow-md shadow-indigo-200'
                    textColor = 'text-white'
                  } else if (familyMode) {
                    if (isOccupied) {
                      statusColor = 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      textColor = 'text-slate-400'
                    } else {
                      statusColor = 'bg-white border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:bg-indigo-50 hover:shadow-md'
                    }
                  }`;
                  
const newStyles = `if (isUndoSelected) {
                    statusColor = 'bg-red-600 border-red-700 scale-105 shadow-md shadow-red-200'
                    textColor = 'text-white'
                  } else if (undoMode) {
                    if (!isOccupied) {
                      statusColor = 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      textColor = 'text-slate-400'
                    } else {
                      // We want occupied beds to look selectable
                      statusColor = 'bg-orange-100 border-orange-300 hover:border-red-500 hover:bg-red-100 hover:shadow-md cursor-pointer'
                      textColor = 'text-orange-900'
                    }
                  } else if (isFamilySelected) {
                    statusColor = 'bg-indigo-600 border-indigo-700 scale-105 shadow-md shadow-indigo-200'
                    textColor = 'text-white'
                  } else if (familyMode) {
                    if (isOccupied) {
                      statusColor = 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                      textColor = 'text-slate-400'
                    } else {
                      statusColor = 'bg-white border-indigo-200 hover:border-indigo-400 text-indigo-700 hover:bg-indigo-50 hover:shadow-md cursor-pointer'
                    }
                  }`;

content = content.replace(oldStyles, newStyles);

fs.writeFileSync(path, content);
console.log('RoomList updated with undoMode');
