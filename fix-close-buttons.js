const fs = require('fs');

function fixCloseButtons(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Fix ALL close buttons that have 'absolute top-4 right-4'
  content = content.replace(
    /<button\s+onClick=\{([^\}]+)\}\s+className="absolute top-4 right-4[^>]+>[\s\S]*?<\/button>/g,
    `<button onClick={$1} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold shadow-sm">X</button>`
  );

  // Add a Cancel button to the single Bed Details modal's form actions if it doesn't exist
  // We look for: <div className="pt-2 flex gap-3">
  if (!content.includes('Cancel</button>')) {
    content = content.replace(
      /<div className="pt-2 flex gap-3">/g,
      `<div className="pt-2 flex gap-3">
                      <button type="button" onClick={() => setSelectedBed(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 text-center transition-all">Cancel</button>`
    );
  }

  // Also fix the group booking modal cancel button to match the new style
  content = content.replace(
    /className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"/g,
    'className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-all"'
  );

  fs.writeFileSync(path, content);
}

fixCloseButtons('src/components/hotels/RoomList.tsx');
fixCloseButtons('src/components/shads/ShadBedList.tsx');
console.log('Fixed close buttons');
