const fs = require('fs')

function fixComponent(path) {
  let content = fs.readFileSync(path, 'utf8')
  
  // 1. Add checkInDate to regData initialization
  content = content.replace(/checkOutDate: '', gender: ''/g, "checkOutDate: '', checkInDate: '', gender: ''")
  
  // 2. Add Expected Check-In field for regData form right before Check-Out field
  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Expected Check-Out/g,
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
                    <label className="block text-sm font-medium mb-1">Expected Check-Out`
  )
  
  // 3. Add checkInDate to groupData
  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Expected Check-Out \(Optional\)<\/label>\s*<input\s*type="date"\s*value={data.checkOutDate \|\| ''}\s*onChange={\(e\) => {/g,
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
                        value={data.checkOutDate || ''} 
                        onChange={(e) => {`
  )

  // 4. Family Booking
  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Expected Check-Out \(Optional\)<\/label>\s*<input\s*type="date"\s*value={familyData.checkOutDate}\s*onChange={e => setFamilyData\({...familyData, checkOutDate: e.target.value}\)}/g,
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
                value={familyData.checkOutDate || ''} 
                onChange={e => setFamilyData({...familyData, checkOutDate: e.target.value})}`
  )
  
  fs.writeFileSync(path, content)
}

fixComponent('src/components/hotels/RoomList.tsx')
fixComponent('src/components/shads/ShadBedList.tsx')
console.log('Fixed frontends')
