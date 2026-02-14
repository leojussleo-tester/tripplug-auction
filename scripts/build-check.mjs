import { access } from 'node:fs/promises';

const requiredFiles = [
  'prisma/schema.prisma',
  'prisma/seed.js',
  'src/app/auctions/page.js',
  'src/lib/prisma.js'
];

for (const file of requiredFiles) {
  await access(file);
}

console.log('Build check passed.');
