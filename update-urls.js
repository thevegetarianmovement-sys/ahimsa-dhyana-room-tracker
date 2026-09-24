const fs = require('fs');

let content = fs.readFileSync('src/app/volunteer/login/VolunteerLoginForm.tsx', 'utf8');
content = content.replace(/fetch\(`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\|\s*'http:\/\/127\.0\.0\.1:4000'\}\/api\/auth\/volunteer-login`/g, "fetch('/api/auth/volunteer-login'");
fs.writeFileSync('src/app/volunteer/login/VolunteerLoginForm.tsx', content);

let content2 = fs.readFileSync('src/components/LogoutButton.tsx', 'utf8');
content2 = content2.replace(/fetch\(`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\|\s*'http:\/\/127\.0\.0\.1:4000'\}\/api\/auth\/logout`/g, "fetch('/api/auth/logout'");
fs.writeFileSync('src/components/LogoutButton.tsx', content2);
