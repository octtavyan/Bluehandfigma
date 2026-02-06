#!/usr/bin/env node

// Fix package.json by removing auto-added "Supabase" dependency
// This runs before npm install to clean up Figma Make's auto-detection

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');

try {
  console.log('🔧 Fixing package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Remove the problematic "Supabase" dependency if it exists
  if (packageJson.dependencies && packageJson.dependencies.Supabase) {
    console.log('❌ Removing invalid "Supabase" dependency...');
    delete packageJson.dependencies.Supabase;
  }
  
  // Write back the fixed package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✅ package.json fixed successfully!');
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
  process.exit(1);
}
