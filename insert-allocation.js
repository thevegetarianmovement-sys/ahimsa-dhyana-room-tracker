const fs = require('fs');

function insertAllocationButton(file, isHotel) {
  let content = fs.readFileSync(file, 'utf8');
  if(!content.includes('ShareAllocationButton')) {
    content = content.replace(
      "import { useState } from 'react'",
      "import { useState } from 'react'\nimport ShareAllocationButton from '../ShareAllocationButton'"
    );
    
    let buttonHtml;
    if (isHotel) {
      buttonHtml = `
                  <div className="pt-4 border-t mt-4">
                    <ShareAllocationButton 
                      participantName={selectedBed.allocations[0].participant?.name || ''}
                      hotelName={hotel.name}
                      address={hotel.address}
                      googleMapsLink={hotel.googleMapsLink}
                      roomNo={selectedBed.roomNumber}
                      bedNo={selectedBed.number}
                    />
                  </div>
                  <div className="pt-4 mt-2 flex gap-3">`;
    } else {
      buttonHtml = `
                  <div className="pt-4 border-t mt-4">
                    <ShareAllocationButton 
                      participantName={selectedBed.allocations[0].participant?.name || ''}
                      hotelName={shad.name}
                      address={shad.address}
                      googleMapsLink={shad.googleMapsLink}
                      roomNo="N/A"
                      bedNo={selectedBed.number}
                    />
                  </div>
                  <div className="pt-4 mt-2 flex gap-3">`;
    }

    content = content.replace(
      '<div className="pt-4 border-t mt-4 flex gap-3">',
      buttonHtml
    );
    fs.writeFileSync(file, content);
  }
}

insertAllocationButton('src/components/hotels/RoomList.tsx', true);
insertAllocationButton('src/components/shads/ShadBedList.tsx', false);
