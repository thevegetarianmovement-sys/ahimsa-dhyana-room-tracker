const fs = require('fs');

function fixVolunteerPage(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Add import
  if (!content.includes("import RoomList")) {
    content = content.replace(
      /import ShareHotelButton from '@\/components\/ShareHotelButton'/g,
      "import ShareHotelButton from '@/components/ShareHotelButton'\nimport RoomList from '@/components/hotels/RoomList'"
    );
  }

  // Replace manual rooms with RoomList
  const regex = /<h2 className="text-xl font-bold text-slate-800 ml-2">Rooms<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\s*\}/;
  content = content.replace(
    regex,
    `
      <div className="mt-8">
        <RoomList rooms={hotel.rooms} hotelId={hotel.id} hotel={hotel} isVolunteer={true} />
      </div>
    </div>
  </div>
  )
}`
  );

  fs.writeFileSync(path, content);
}

fixVolunteerPage('src/app/volunteer/hotels/[id]/page.tsx');
console.log('Volunteer page updated to use RoomList');
