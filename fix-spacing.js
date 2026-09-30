const fs = require('fs');

function fixSpacing(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Fix gap and add spaces for copy-pasting
  content = content.replace(/<div className="flex flex-wrap gap-1 mb-4">/g, '<div className="flex flex-wrap gap-2 mb-4">');
  content = content.replace(/<div className="flex flex-wrap gap-1 mt-2">/g, '<div className="flex flex-wrap gap-2 mt-2">');
  
  content = content.replace(
    /<\/span>\s*\}\)\}/g,
    '</span>\n                        <span className="hidden"> </span>\n                      ))}'
  );
  
  content = content.replace(
    /<\/span>\}<\/h3>/g,
    '</span> <span className="hidden"> </span>}</h3>'
  );

  fs.writeFileSync(path, content);
}

fixSpacing('src/app/hotels/page.tsx');
fixSpacing('src/app/volunteer/hotels/page.tsx');
console.log('Fixed UI spacing');
