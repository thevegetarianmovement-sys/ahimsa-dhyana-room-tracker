const fs = require('fs')

function fixComponent(path) {
  let content = fs.readFileSync(path, 'utf8')
  
  // 1. Initial state objects
  content = content.replace(/checkOutDate: '', gender: '' }/g, "checkOutDate: '', checkInDate: '', gender: '' }")
  
  // 2. RegData Check-In
  content = content.replace(
    /value={regData.checkOutDate}/g,
    'value={regData.checkOutDate}' // just an anchor
  )
  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Expected Check-Out \(Optional\)<\/label>\s*<input \s*type="date" \s*value={regData.checkOutDate}/g,
    `<div>
                    <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                    <input 
                      type="date" 
                      value={regData.checkInDate || ''} 
                      onChange={e => setRegData({...regData, checkInDate: e.target.value})}
                      className="w-full border px-3 py-2 rounded focus:ring focus:outline-none mb-4" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                    <input 
                      type="date" 
                      value={regData.checkOutDate}`
  )
  
  // 3. GroupData Check-In
  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Expected Check-Out \(Optional\)<\/label>\s*<input \s*type="date" \s*value={data.checkOutDate}/g,
    `<div>
                      <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                      <input 
                        type="date" 
                        value={data.checkInDate || ''} 
                        onChange={(e) => {
                          const nd = [...groupData];
                          nd[idx].checkInDate = e.target.value;
                          setGroupData(nd);
                        }}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none mb-4" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                      <input 
                        type="date" 
                        value={data.checkOutDate}`
  )

  // 4. Family Booking (if exists)
  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Expected Check-Out \(Optional\)<\/label>\s*<input \s*type="date" \s*value={familyData.checkOutDate}/g,
    `<div>
              <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
              <input 
                type="date" 
                value={familyData.checkInDate || ''} 
                onChange={e => setFamilyData({...familyData, checkInDate: e.target.value})}
                className="w-full border px-3 py-2 rounded focus:ring focus:outline-none mb-4" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
              <input 
                type="date" 
                value={familyData.checkOutDate}`
  )
  
  fs.writeFileSync(path, content)
}

fixComponent('src/components/hotels/RoomList.tsx')
fixComponent('src/components/shads/ShadBedList.tsx')
console.log('Fixed frontends')
