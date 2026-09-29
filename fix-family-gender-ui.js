const fs = require('fs');

function fixComponent(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Replace familyData state to have maleCount and femaleCount instead of gender
  content = content.replace(
    /const \[familyData, setFamilyData\] = useState\(\{ name: '', phone: '', gender: '', checkInDate: '', checkOutDate: '', autoCount: '' \}\);/g,
    "const [familyData, setFamilyData] = useState({ name: '', phone: '', maleCount: '', femaleCount: '', checkInDate: '', checkOutDate: '', autoCount: '' });"
  );
  content = content.replace(
    /setFamilyData\(\{ name: '', phone: '', gender: '', checkInDate: '', checkOutDate: '', autoCount: '' \}\);/g,
    "setFamilyData({ name: '', phone: '', maleCount: '', femaleCount: '', checkInDate: '', checkOutDate: '', autoCount: '' });"
  );

  // Replace the gender dropdown UI
  const oldGenderRegex = /<div>\s*<label className="block text-sm font-medium mb-1">Gender \(Optional\)<\/label>\s*<select value=\{familyData\.gender\}([\s\S]*?)<\/select>\s*<\/div>/g;
  const newGenderUI = `<div>
                    <label className="block text-sm font-medium mb-1">Number of Males (Optional)</label>
                    <input type="number" min="0" value={familyData.maleCount} onChange={e => setFamilyData({...familyData, maleCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Females (Optional)</label>
                    <input type="number" min="0" value={familyData.femaleCount} onChange={e => setFamilyData({...familyData, femaleCount: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring bg-white" />
                  </div>`;
  
  content = content.replace(oldGenderRegex, newGenderUI);

  // Replace payload building
  content = content.replace(
    /gender: familyData\.gender,/g,
    "maleCount: familyData.maleCount ? parseInt(familyData.maleCount) : 0,\n            femaleCount: familyData.femaleCount ? parseInt(familyData.femaleCount) : 0,"
  );

  fs.writeFileSync(path, content);
}

fixComponent('src/components/hotels/RoomList.tsx');
fixComponent('src/components/shads/ShadBedList.tsx');
console.log('Fixed family UI');
