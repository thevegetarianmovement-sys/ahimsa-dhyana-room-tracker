const fs = require('fs');

function updateService(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace arguments
  content = content.replace(/data: \{ name: string, code: string, location: string \}/g, "data: { name: string, code: string, location: string, address?: string, googleMapsLink?: string }");
  content = content.replace(/data: \{ name: string, code: string, capacity: number \}/g, "data: { name: string, code: string, capacity: number, address?: string, googleMapsLink?: string }");
  
  // Replace data mappings in create/update
  content = content.replace(/location: data\.location,?\s*\}/g, "location: data.location,\n      address: data.address,\n      googleMapsLink: data.googleMapsLink\n    }");
  content = content.replace(/capacity: data\.capacity,?\s*\}/g, "capacity: data.capacity,\n      address: data.address,\n      googleMapsLink: data.googleMapsLink\n    }");
  
  fs.writeFileSync(file, content);
}

updateService('backend/src/services/hotel.service.ts');
updateService('backend/src/services/shad.service.ts');
