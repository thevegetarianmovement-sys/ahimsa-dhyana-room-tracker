const fs = require('fs');

function fixComponent(path) {
  let content = fs.readFileSync(path, 'utf8');

  // 1. Overlay (Background)
  content = content.replace(
    /className="fixed inset-0 bg-black\/50 flex items-center justify-center z-50 p-4"/g,
    'className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"'
  );

  // 2. Modal Container
  content = content.replace(
    /className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"/g,
    'className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-8 relative animate-in zoom-in-95 duration-200"'
  );
  content = content.replace(
    /className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-\[90vh\] overflow-y-auto"/g,
    'className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"'
  );

  // 3. Inputs and Selects
  content = content.replace(
    /className="w-full border px-3 py-2 rounded focus:ring focus:outline-none mb-4"/g,
    'className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all mb-4"'
  );
  content = content.replace(
    /className="w-full border px-3 py-2 rounded focus:ring focus:outline-none bg-white"/g,
    'className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"'
  );
  content = content.replace(
    /className="w-full border px-3 py-2 rounded focus:ring focus:outline-none"/g,
    'className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"'
  );
  content = content.replace(
    /className="w-full border px-3 py-2 rounded focus:ring bg-white"/g,
    'className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"'
  );
  content = content.replace(
    /className="w-full border px-3 py-2 rounded focus:ring"/g,
    'className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"'
  );

  // 4. Modal Titles
  content = content.replace(/<h3 className="text-xl font-bold/g, '<h3 className="text-2xl font-extrabold tracking-tight');
  
  // 5. Labels
  content = content.replace(/className="block text-sm font-medium mb-1"/g, 'className="block text-sm font-semibold text-slate-700 mb-1.5"');

  // 6. Primary Buttons (Purple, Indigo, Green)
  content = content.replace(
    /className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 disabled:opacity-50 mt-2"/g,
    'className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all mt-4"'
  );
  content = content.replace(
    /className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50 mt-2"/g,
    'className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all mt-4"'
  );
  content = content.replace(
    /className="bg-emerald-600 text-white px-6 py-2 rounded shadow hover:bg-emerald-700 disabled:opacity-50 font-medium"/g,
    'className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 font-bold transition-all"'
  );
  content = content.replace(
    /className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"/g,
    'className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md disabled:opacity-50 transition-all"'
  );

  // 7. Secondary Buttons (Cancel, View Profile)
  content = content.replace(
    /className="flex-1 bg-slate-200 text-slate-800 py-2 rounded font-medium hover:bg-slate-300 text-center"/g,
    'className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 text-center transition-all"'
  );
  content = content.replace(
    /className="flex-1 bg-slate-200 text-slate-800 py-2 rounded font-medium hover:bg-slate-300 text-center text-sm flex items-center justify-center"/g,
    'className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 text-center text-sm flex items-center justify-center transition-all"'
  );
  
  // 8. Close X buttons
  content = content.replace(
    /className="absolute top-4 right-4 text-slate-400">[\s\S]*?<\/button>/g,
    'className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold">X</button>'
  );
  content = content.replace(
    /className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">[\s\S]*?<\/button>/g,
    'className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors font-bold">X</button>'
  );

  fs.writeFileSync(path, content);
}

fixComponent('src/components/hotels/RoomList.tsx');
fixComponent('src/components/shads/ShadBedList.tsx');
console.log('UI Upgraded successfully');
