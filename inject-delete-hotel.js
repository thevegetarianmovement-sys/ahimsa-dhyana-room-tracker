const fs = require('fs');
let content = fs.readFileSync('src/app/hotels/[id]/page.tsx', 'utf8');
content = 'import DeleteHotelButton from "@/components/hotels/DeleteHotelButton"\n' + content;
content = content.replace(
  '<ShareHotelButton hotel={hotel} />',
  '<ShareHotelButton hotel={hotel} />\n              <DeleteHotelButton hotelId={hotel.id} />'
);
fs.writeFileSync('src/app/hotels/[id]/page.tsx', content);
