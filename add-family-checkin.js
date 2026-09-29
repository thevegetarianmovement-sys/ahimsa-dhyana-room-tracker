const fs = require('fs')

function fixComponent(path) {
  let content = fs.readFileSync(path, 'utf8')
  
  // Add checkInDate to familyData state
  content = content.replace(
    /const \[familyData, setFamilyData\] = useState\(\{ name: '', phone: '', gender: '', checkOutDate: '', autoCount: '' \}\);/g,
    "const [familyData, setFamilyData] = useState({ name: '', phone: '', gender: '', checkInDate: '', checkOutDate: '', autoCount: '' });"
  )
  content = content.replace(
    /setFamilyData\(\{ name: '', phone: '', gender: '', checkOutDate: '', autoCount: '' \}\);/g,
    "setFamilyData({ name: '', phone: '', gender: '', checkInDate: '', checkOutDate: '', autoCount: '' });"
  )

  // Inject the Check-In and Check-Out fields directly below the Phone field in both Family Modals
  const replacementHTML = `<div>
                    <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                    <input type="text" value={familyData.phone} onChange={e => setFamilyData({...familyData, phone: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-In (Optional)</label>
                    <input type="date" value={familyData.checkInDate || ''} onChange={e => setFamilyData({...familyData, checkInDate: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Check-Out (Optional)</label>
                    <input type="date" value={familyData.checkOutDate || ''} onChange={e => setFamilyData({...familyData, checkOutDate: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring" />
                  </div>`

  content = content.replace(
    /<div>\s*<label className="block text-sm font-medium mb-1">Phone \(Optional\)<\/label>\s*<input type="text" value=\{familyData\.phone\} onChange=\{e => setFamilyData\(\{\.\.\.familyData, phone: e\.target\.value\}\)\} className="w-full border px-3 py-2 rounded focus:ring" \/>\s*<\/div>/g,
    replacementHTML
  )

  // Ensure payload sends checkInDate
  content = content.replace(
    /gender: familyData\.gender,\s*checkOutDate: familyData\.checkOutDate\s*\}/g,
    "gender: familyData.gender,\n            checkInDate: familyData.checkInDate,\n            checkOutDate: familyData.checkOutDate\n          }"
  )
  
  fs.writeFileSync(path, content)
}

fixComponent('src/components/hotels/RoomList.tsx')
fixComponent('src/components/shads/ShadBedList.tsx')
console.log('Fixed family booking UI')
