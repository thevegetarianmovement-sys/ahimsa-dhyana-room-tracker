const fs = require('fs');

const path = 'src/app/volunteer/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<Link[\s\S]*?href="\/volunteer\/login"[\s\S]*?>[\s\S]*?Switch[\s\S]*?<\/Link>/g;
content = content.replace(regex, '<SwitchButton />');

fs.writeFileSync(path, content);
console.log('Fixed SwitchButton replacement');
