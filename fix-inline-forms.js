const fs = require('fs');

function updateInlineForms(file) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Update regData state
  content = content.replace(
    /const \[regData, setRegData\] = useState\(\{ name: '', phone: '', registrationNumber: '', checkOutDate: '' \}\)/g,
    "const [regData, setRegData] = useState({ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' })"
  );
  content = content.replace(
    /setRegData\(\{ name: '', phone: '', registrationNumber: '', checkOutDate: '' \}\)/g,
    "setRegData({ name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: '' })"
  );

  // 2. Update groupData state
  content = content.replace(
    /const \[groupData, setGroupData\] = useState<\{name: string, phone: string, registrationNumber: string, checkOutDate: string\}\[\]>\(\[\]\)/g,
    "const [groupData, setGroupData] = useState<{name: string, phone: string, registrationNumber: string, checkOutDate: string, gender: string}[]>([])"
  );
  content = content.replace(
    /Array\(room\.beds\.filter.*\.fill\(\{name: '', phone: '', registrationNumber: '', checkOutDate: ''\}\)/g,
    (match) => match.replace("{name: '', phone: '', registrationNumber: '', checkOutDate: ''}", "{name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: ''}")
  );
  content = content.replace(
    /Array\(shad\.beds\.filter.*\.fill\(\{name: '', phone: '', registrationNumber: '', checkOutDate: ''\}\)/g,
    (match) => match.replace("{name: '', phone: '', registrationNumber: '', checkOutDate: ''}", "{name: '', phone: '', registrationNumber: '', checkOutDate: '', gender: ''}")
  );

  // 3. Add Gender to Quick Register form
  const quickRegPhoneInput = `<div>
                      <label className="block text-sm font-medium mb-1">Phone (Optional)</label>`;
  const quickRegGenderInput = `<div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <select 
                        value={regData.gender} 
                        onChange={e => setRegData({...regData, gender: e.target.value})}
                        className="w-full border px-3 py-2 rounded focus:ring focus:outline-none bg-white" 
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone (Optional)</label>`;
  
  if(!content.includes('value={regData.gender}')) {
    content = content.replace(quickRegPhoneInput, quickRegGenderInput);
  }

  // 4. Add Gender to Group Register form
  const groupRegPhoneInput = `<div>
                        <label className="block text-sm font-medium mb-1">Phone (Optional)</label>`;
  const groupRegGenderInput = `<div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select 
                          value={data.gender} 
                          onChange={e => {
                            const nd = [...groupData]; 
                            nd[idx].gender = e.target.value; 
                            setGroupData(nd);
                          }}
                          className="w-full border px-3 py-2 rounded focus:ring focus:outline-none bg-white" 
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone (Optional)</label>`;
                        
  if(!content.includes('value={data.gender}')) {
    content = content.replace(groupRegPhoneInput, groupRegGenderInput);
  }

  fs.writeFileSync(file, content);
}

updateInlineForms('src/components/hotels/RoomList.tsx');
updateInlineForms('src/components/shads/ShadBedList.tsx');
