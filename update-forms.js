const fs = require('fs');

function updateForm(file, replaceTarget, appendStr, buttonRegex, newFields) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(replaceTarget, replaceTarget + appendStr);
  content = content.replace(buttonRegex, newFields + '\n      <button');
  
  if(file.includes('HotelEditForm')) {
    content = content.replace(/<div className="flex justify-end\n      <button/, newFields + '\n      <div className="flex justify-end');
  }
  
  fs.writeFileSync(file, content);
}

// 1. HotelForm
updateForm('src/components/hotels/HotelForm.tsx',
  "location: formData.get('location') as string",
  ",\n          address: formData.get('address') as string,\n          googleMapsLink: formData.get('googleMapsLink') as string",
  /<button/,
  `<div>
        <label className="block text-sm font-medium text-slate-700">Full Address (Optional)</label>
        <textarea name="address" className="mt-1 block w-full border px-3 py-2 rounded" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="https://goo.gl/maps/..." />
      </div>`
);

// 2. HotelEditForm
updateForm('src/components/hotels/HotelEditForm.tsx',
  "location: formData.get('location') as string",
  ",\n          address: formData.get('address') as string,\n          googleMapsLink: formData.get('googleMapsLink') as string",
  /<div className="flex justify-end/,
  `<div>
        <label className="block text-sm font-medium text-slate-700">Full Address (Optional)</label>
        <textarea name="address" defaultValue={hotel.address || ''} className="mt-1 block w-full border px-3 py-2 rounded" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" defaultValue={hotel.googleMapsLink || ''} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="https://goo.gl/maps/..." />
      </div>`
);

// 3. ShadForm
updateForm('src/components/shads/ShadForm.tsx',
  "capacity: parseInt(formData.get('capacity') as string)",
  ",\n          address: formData.get('address') as string,\n          googleMapsLink: formData.get('googleMapsLink') as string",
  /<button/,
  `<div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Address (Optional)</label>
        <textarea name="address" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://goo.gl/maps/..." />
      </div>`
);

// 4. ShadEditForm
updateForm('src/components/shads/ShadEditForm.tsx',
  "capacity: parseInt(formData.get('capacity') as string)",
  ",\n          address: formData.get('address') as string,\n          googleMapsLink: formData.get('googleMapsLink') as string",
  /<button/,
  `<div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Address (Optional)</label>
        <textarea name="address" defaultValue={shad.address || ''} className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={3}></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Google Maps Link (Optional)</label>
        <input name="googleMapsLink" defaultValue={shad.googleMapsLink || ''} className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="https://goo.gl/maps/..." />
      </div>`
);

// ParticipantForm (Gender dropdown)
let pContent = fs.readFileSync('src/components/participants/ParticipantForm.tsx', 'utf8');
pContent = pContent.replace(
  "phone: formData.get('phone') as string,",
  "phone: formData.get('phone') as string,\n          gender: formData.get('gender') as string,"
);

const genderSelect = `<div>
        <label className="block text-sm font-medium text-slate-700">Gender</label>
        <select name="gender" defaultValue={initialData?.gender || ''} className="mt-1 block w-full border px-3 py-2 rounded">
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <button`;

pContent = pContent.replace(/<button/, genderSelect);
fs.writeFileSync('src/components/participants/ParticipantForm.tsx', pContent);
