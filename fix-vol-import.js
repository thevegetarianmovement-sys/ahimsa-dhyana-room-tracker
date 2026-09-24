const fs = require('fs');

let file = 'src/app/volunteer/hotels/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

if(!content.includes("import ShareHotelButton")) {
  content = content.replace(
    "import { notFound } from 'next/navigation'", 
    "import { notFound } from 'next/navigation'\nimport ShareHotelButton from '@/components/ShareHotelButton'"
  );
  fs.writeFileSync(file, content);
}
