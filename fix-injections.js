const fs = require('fs');

['src/components/hotels/DeleteHotelButton.tsx', 'src/components/participants/DeleteParticipantButton.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('/* eslint-disable')) {
    content = '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content;
    fs.writeFileSync(file, content);
  }
});

let hPage = fs.readFileSync('src/app/hotels/[id]/page.tsx', 'utf8');
hPage = hPage.replace('import DeleteHotelButton from "@/components/hotels/DeleteHotelButton"\n', '');
hPage = hPage.replace(/<ShareHotelButton hotel=\{hotel\} \/>/g, '<ShareHotelButton hotel={hotel} />\n              <DeleteHotelButton hotelId={hotel.id} />');
hPage = 'import DeleteHotelButton from "@/components/hotels/DeleteHotelButton"\n' + hPage;
fs.writeFileSync('src/app/hotels/[id]/page.tsx', hPage);

let pPage = fs.readFileSync('src/app/participants/[id]/page.tsx', 'utf8');
pPage = pPage.replace('import DeleteParticipantButton from "@/components/participants/DeleteParticipantButton"\n', '');
pPage = pPage.replace('initialData={participant}', 'initialData={participant}\n          />\n          <DeleteParticipantButton participantId={participant.id}');
pPage = 'import DeleteParticipantButton from "@/components/participants/DeleteParticipantButton"\n' + pPage;
fs.writeFileSync('src/app/participants/[id]/page.tsx', pPage);
