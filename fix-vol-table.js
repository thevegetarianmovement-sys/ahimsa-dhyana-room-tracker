const fs = require('fs');
let c = fs.readFileSync('src/app/volunteers/page.tsx', 'utf8');

c = c.replace(
  '<th className="px-6 py-3 text-sm font-medium text-slate-500">Status</th>',
  '<th className="px-6 py-3 text-sm font-medium text-slate-500">Status</th>\n<th className="px-6 py-3 text-sm font-medium text-slate-500">Shifts</th>'
);

c = c.replace(
  `                <td className="px-6 py-4 text-right">`,
  `                <td className="px-6 py-4 text-slate-600 text-sm">
                  {v.shifts?.length || 0} shift(s)
                </td>
                <td className="px-6 py-4 text-right">`
);

fs.writeFileSync('src/app/volunteers/page.tsx', c);
