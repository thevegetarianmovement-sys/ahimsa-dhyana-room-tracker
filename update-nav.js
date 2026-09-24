const fs = require('fs');

function addVolunteerLink(file, isMobile) {
  let content = fs.readFileSync(file, 'utf8');
  let search, replace;
  
  if (isMobile) {
    search = /<a href="\/reports"/g;
    replace = '<a href="/volunteers" className="block py-2 px-4 rounded hover:bg-slate-800">Volunteers</a>\n                <a href="/reports"';
  } else {
    search = /<a href="\/reports"/g;
    replace = '<a href="/volunteers" className="block py-2 px-4 rounded hover:bg-slate-800 whitespace-nowrap">Volunteers</a>\n                      <a href="/reports"';
  }
  
  if (!content.includes('/volunteers"')) {
    let updated = content.replace(search, replace);
    fs.writeFileSync(file, updated);
    console.log('Updated', file);
  } else {
    console.log('Already has volunteers', file);
  }
}

addVolunteerLink('src/app/layout.tsx', false);
addVolunteerLink('src/components/layout/MobileNav.tsx', true);
