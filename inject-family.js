const fs = require('fs');

function injectFamilyBooking(file, isHotel) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Inject State
  const stateInject = `  const [familyMode, setFamilyMode] = useState(false);
  const [familyCart, setFamilyCart] = useState<string[]>([]);
  const [autoFamilyModal, setAutoFamilyModal] = useState(false);
  const [manualFamilyModal, setManualFamilyModal] = useState(false);
  const [familyData, setFamilyData] = useState({ name: '', phone: '', gender: '', checkOutDate: '', autoCount: '' });
  
  const handleBedClick = (bed: any, room: any) => {
    if (familyMode) {
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

  const submitFamilyBooking = async (type: 'AUTO' | 'MANUAL') => {
    setRegistering(true);
    try {
      const payload = {
        data: {
          name: familyData.name,
          phone: familyData.phone,
          gender: familyData.gender,
          checkOutDate: familyData.checkOutDate
        },
        locationId: ${isHotel ? 'hotelId' : 'shadId'},
        type: '${isHotel ? 'HOTEL' : 'SHAD'}',
        bookingParams: {
          autoCount: type === 'AUTO' ? parseInt(familyData.autoCount) : undefined,
          bedIds: type === 'MANUAL' ? familyCart : undefined
        }
      };

      const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/allocations/family-book\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Error booking family');
      }
      setAutoFamilyModal(false);
      setManualFamilyModal(false);
      setFamilyMode(false);
      setFamilyCart([]);
      setFamilyData({ name: '', phone: '', gender: '', checkOutDate: '', autoCount: '' });
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setRegistering(false);
    }
  };
`;
  
  if(!content.includes('const [familyMode')) {
    content = content.replace(
      "const [groupData, setGroupData] =", 
      stateInject + "\n  const [groupData, setGroupData] ="
    );
  }

  // 2. Inject UI Buttons
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

  // Place buttons right after the "Filter" div ends, before the room grid.
  // The filter div ends with </select>\n      </div>
  // Wait, let's just place it before <div className="grid... or whatever renders the rooms.
  const filterEndRegex = /<div className="mb-6 flex items-center gap-4">[\s\S]*?<\/div>/;
  
  if(!content.includes('Family Booking Controls')) {
    content = content.replace(filterEndRegex, (match) => match + '\n' + buttonsUI);
  }

  // 3. Update Bed onClick
  content = content.replace(
    /onClick=\{\(\) => setSelectedBed\(\{ \.\.\.bed, roomNumber: room\.number \}\)\}/g,
    `onClick={() => handleBedClick(bed, room)}`
  );
  content = content.replace(
    /onClick=\{\(\) => setSelectedBed\(\{ \.\.\.bed \}\)\}/g,
    `onClick={() => handleBedClick(bed, null)}`
  );

  // 4. Update Bed Styles for Selection
  // Add a border if it's in the cart.
  content = content.replace(
    /className=\{`w-12 h-12 rounded flex items-center justify-center text-white font-bold shadow-sm \$\{statusColor\}`\}/g,
    `className={\`w-12 h-12 rounded flex items-center justify-center text-white font-bold shadow-sm \${statusColor} \${familyCart.includes(bed.id) ? 'ring-4 ring-purple-600 ring-offset-2' : ''}\`}`
  );
  content = content.replace(
    /className=\{`w-12 h-12 rounded flex items-center justify-center text-white font-bold \$\{statusColor\}`\}/g,
    `className={\`w-12 h-12 rounded flex items-center justify-center text-white font-bold \${statusColor} \${familyCart.includes(bed.id) ? 'ring-4 ring-purple-600 ring-offset-2' : ''}\`}`
  );

  // 5. Inject Modals at the bottom
  const modalsUI = `
        {/* Auto Family Modal */}
        {autoFamilyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setAutoFamilyModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h3 className="text-xl font-bold mb-4 text-purple-900">Auto-Assign Family Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Family/Main Name *</label>
                  <input type="text" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Beds Needed *</label>
                  <input type="number" min="1" value={familyData.autoCount} onChange={e => setFamilyData({...familyData, autoCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender (Optional)</label>
                  <select value={familyData.gender} onChange={e => setFamilyData({...familyData, gender: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white">
                    <option value="">Mixed / Unspecified</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                  <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <button 
                  onClick={() => submitFamilyBooking('AUTO')}
                  disabled={registering || !familyData.name || !familyData.autoCount}
                  className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 disabled:opacity-50 mt-2"
                >
                  {registering ? 'Processing...' : 'Auto-Assign Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Family Modal */}
        {manualFamilyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button onClick={() => setManualFamilyModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
              <h3 className="text-xl font-bold mb-4 text-indigo-900">Book {familyCart.length} Selected Beds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Family/Main Name *</label>
                  <input type="text" value={familyData.name} onChange={e => setFamilyData({...familyData, name: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender (Optional)</label>
                  <select value={familyData.gender} onChange={e => setFamilyData({...familyData, gender: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white">
                    <option value="">Mixed / Unspecified</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                  <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                </div>
                <button 
                  onClick={() => submitFamilyBooking('MANUAL')}
                  disabled={registering || !familyData.name}
                  className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50 mt-2"
                >
                  {registering ? 'Processing...' : 'Book Selected Beds Now'}
                </button>
              </div>
            </div>
          </div>
        )}
  `;

  if(!content.includes('Auto Family Modal')) {
    content = content.replace(/(?=<\/div>\s*<\/div>\s*\)\s*\})/, modalsUI);
  }

  fs.writeFileSync(file, content);
}

injectFamilyBooking('src/components/hotels/RoomList.tsx', true);
injectFamilyBooking('src/components/shads/ShadBedList.tsx', false);
