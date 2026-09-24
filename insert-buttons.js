const fs = require('fs');

function insertAdminHotel() {
  let content = fs.readFileSync('src/app/hotels/[id]/page.tsx', 'utf8');
  if(!content.includes('ShareHotelButton')) {
    content = content.replace(
      "import PrintButton from '@/components/PrintButton'",
      "import PrintButton from '@/components/PrintButton'\nimport ShareHotelButton from '@/components/ShareHotelButton'"
    );
    content = content.replace(
      "<PrintButton />",
      "<ShareHotelButton name={hotel.name} address={hotel.address} googleMapsLink={hotel.googleMapsLink} />\n            <PrintButton />"
    );
    fs.writeFileSync('src/app/hotels/[id]/page.tsx', content);
  }
}

function insertVolHotel() {
  let content = fs.readFileSync('src/app/volunteer/hotels/[id]/page.tsx', 'utf8');
  if(!content.includes('ShareHotelButton')) {
    content = content.replace(
      "import RoomList from '@/components/hotels/RoomList'",
      "import RoomList from '@/components/hotels/RoomList'\nimport ShareHotelButton from '@/components/ShareHotelButton'"
    );
    content = content.replace(
      '<h1 className="text-3xl font-bold text-slate-800">{hotel.name}</h1>',
      `<div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-slate-800">{hotel.name}</h1>
          <ShareHotelButton name={hotel.name} address={hotel.address} googleMapsLink={hotel.googleMapsLink} />
        </div>`
    );
    fs.writeFileSync('src/app/volunteer/hotels/[id]/page.tsx', content);
  }
}

insertAdminHotel();
insertVolHotel();
