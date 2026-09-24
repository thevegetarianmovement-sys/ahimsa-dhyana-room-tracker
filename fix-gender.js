const fs = require('fs');

function fixGender(file) {
  let content = fs.readFileSync(file, 'utf8');

  // First, completely strip out any existing gender dropdowns to start clean
  content = content.replace(/<div>\s*<label className="block text-sm font-medium mb-1">Gender<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/g, '');

  // 1. For Quick Register: find 'value={regData.phone}' block and insert Gender right before it
  // The 'Phone' block starts with <div><label...>Phone (Optional)</label>
  const quickRegSearch = /<div>\s*<label className="block text-sm font-medium mb-1">Phone \(Optional\)<\/label>\s*<input\s*type="text"\s*value=\{regData\.phone\}/;
  
  const quickRegReplace = `<div>
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
                      <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                      <input 
                        type="text" 
                        value={regData.phone}`;

  content = content.replace(quickRegSearch, quickRegReplace);


  // 2. For Group Register: find 'value={data.phone}' block and insert Gender right before it
  const groupRegSearch = /<div>\s*<label className="block text-sm font-medium mb-1">Phone \(Optional\)<\/label>\s*<input\s*type="text"\s*value=\{data\.phone\}/;
  
  const groupRegReplace = `<div>
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
                        <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
                        <input 
                          type="text" 
                          value={data.phone}`;

  content = content.replace(groupRegSearch, groupRegReplace);

  fs.writeFileSync(file, content);
}

fixGender('src/components/hotels/RoomList.tsx');
fixGender('src/components/shads/ShadBedList.tsx');
