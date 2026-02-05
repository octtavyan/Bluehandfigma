// Auto-fix script to update all Netopia IPN URLs to public endpoint
// Run this with: node fix-netopia-urls.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'supabase/functions/server/index.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Count occurrences before
const beforeCount = (content.match(/\/netopia\/ipn(?!-public)/g) || []).length;
console.log(`Found ${beforeCount} occurrences of /netopia/ipn (without -public)`);

// Replace all occurrences
// This regex matches /netopia/ipn but NOT /netopia/ipn-public
content = content.replace(/\/netopia\/ipn(?!-public)/g, '/netopia/ipn-public');

// Count occurrences after
const afterCount = (content.match(/\/netopia\/ipn(?!-public)/g) || []).length;
const publicCount = (content.match(/\/netopia\/ipn-public/g) || []).length;

console.log(`After replacement:`);
console.log(`- /netopia/ipn (without -public): ${afterCount}`);
console.log(`- /netopia/ipn-public: ${publicCount}`);

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ File updated successfully!');
console.log(`Updated ${beforeCount} URLs to use public endpoint`);
