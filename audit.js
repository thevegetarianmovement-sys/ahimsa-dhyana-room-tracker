const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const allFiles = [...walk('src'), ...walk('backend')];
const tsFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const frontendFiles = walk('src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

console.log("=== HARDCODED URLS ===");
frontendFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('localhost:4000') || content.includes('127.0.0.1:4000')) {
    console.log('HARDCODED URL:', f);
  }
});

console.log("=== PRISMA IN FRONTEND ===");
frontendFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Skip the api files if any (we don't have Next.js api routes doing DB access anymore)
  if (f.includes('lib\\\\db.ts') || f.includes('lib/db.ts')) return;
  if (content.includes('@prisma/client') || content.includes('prisma.') || content.includes("from '@/lib/db'") || content.includes("from '../../lib/db'") || content.includes("from '../lib/db'")) {
    console.log('PRISMA IN FRONTEND:', f);
  }
});

console.log("=== LEGACY SERVER ACTIONS ===");
frontendFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (f.includes('actions\\\\') || f.includes('actions/')) {
    console.log('SERVER ACTION FILE:', f);
  }
  if (content.includes('"use server"') || content.includes("'use server'") || content.includes("from '@/app/actions/") || content.includes("from '../actions/") || content.includes("from '../../actions/")) {
    console.log('USES SERVER ACTION:', f);
  }
});

console.log("=== SECRETS ===");
allFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('password123') || content.includes('JALSA2026') || content.includes('super-secret')) {
    console.log('SECRET DETECTED:', f);
  }
});
