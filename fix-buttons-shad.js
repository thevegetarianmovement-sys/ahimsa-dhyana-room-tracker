const fs = require('fs');

function injectButtons(file) {
  let content = fs.readFileSync(file, 'utf8');

  const buttonsUI = `
      {/* Family Booking Controls */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="w-full flex justify-between items-center mb-2">
          <h3 className="font-bold text-purple-900">Family Booking</h3>
          {familyMode && (
            <button onClick={() => { setFamilyMode(false); setFamilyCart([]); }} className="text-sm text-purple-700 underline">Cancel Manual Mode</button>
          )}
        </div>
        
        {!familyMode ? (
          <>
            <button 
              onClick={() => setAutoFamilyModal(true)}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 text-sm font-bold"
            >
              Auto-Assign Family
            </button>
            <button 
              onClick={() => { setFamilyMode(true); setFamilyCart([]); }}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm font-bold"
            >
              Manual Select Family
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="font-medium text-purple-800">{familyCart.length} beds selected</span>
            <button 
              onClick={() => setManualFamilyModal(true)}
              disabled={familyCart.length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-bold disabled:opacity-50"
            >
              Book Selected Beds
            </button>
          </div>
        )}
      </div>
`;

  if(!content.includes('Family Booking Controls')) {
    content = content.replace(
      '{filteredBeds.length === 0 && (',
      buttonsUI + '\n      {filteredBeds.length === 0 && ('
    );
    fs.writeFileSync(file, content);
  }
}

injectButtons('src/components/shads/ShadBedList.tsx');
