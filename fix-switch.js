const fs = require('fs');

const path = 'src/app/volunteer/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import SwitchButton')) {
  content = content.replace(
    /import Link from 'next\/link'/g,
    "import Link from 'next/link'\nimport SwitchButton from '@/components/volunteers/SwitchButton'"
  );
}

const oldLink = `<Link 
            href="/volunteer/login" 
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded font-medium transition-colors"
          >
            Switch
          </Link>`;

content = content.replace(oldLink, '<SwitchButton />');

fs.writeFileSync(path, content);
console.log('Updated volunteer page to use SwitchButton');
