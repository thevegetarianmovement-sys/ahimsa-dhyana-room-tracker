const fs = require('fs');

let hPage = fs.readFileSync('src/app/hotels/[id]/page.tsx', 'utf8');
hPage = 'import DeleteHotelButton from "@/components/hotels/DeleteHotelButton"\n' + hPage;
hPage = hPage.replace(
  '<ShareHotelButton name={hotel.name} address={hotel.address} googleMapsLink={hotel.googleMapsLink} />',
  '<ShareHotelButton name={hotel.name} address={hotel.address} googleMapsLink={hotel.googleMapsLink} />\n          <DeleteHotelButton hotelId={hotel.id} />'
);
fs.writeFileSync('src/app/hotels/[id]/page.tsx', hPage);

let pPage = fs.readFileSync('src/app/participants/[id]/page.tsx', 'utf8');
pPage = 'import DeleteParticipantButton from "@/components/participants/DeleteParticipantButton"\n' + pPage;
pPage = pPage.replace(
  '<ParticipantForm initialData={participant} categories={categories} />',
  '<ParticipantForm initialData={participant} categories={categories} />\n          <DeleteParticipantButton participantId={participant.id} />'
);
fs.writeFileSync('src/app/participants/[id]/page.tsx', pPage);
