#!/usr/bin/env node

// Fix package.json by removing auto-added invalid dependencies
// This runs before npm install to clean up Figma Make's auto-detection

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, 'package.json');

try {
  console.log('🔧 Fixing package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // List of problematic dependencies to remove
  const invalidDeps = ['Supabase', 'supabase'];
  
  let fixed = false;
  
  // Remove invalid dependencies
  if (packageJson.dependencies) {
    invalidDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        console.log(`❌ Removing invalid "${dep}" dependency...`);
        delete packageJson.dependencies[dep];
        fixed = true;
      }
    });
    
    // Also fix wildcard versions to specific versions
    const wildcardFixes = {
      'clsx': '^2.1.0',
      'tailwind-merge': '^2.2.1',
      'react-router': '^6.22.0',
      'jspdf': '^2.5.1',
      'sonner': '^1.4.0'
    };
    
    Object.entries(wildcardFixes).forEach(([pkg, version]) => {
      if (packageJson.dependencies[pkg] === '*') {
        console.log(`🔧 Fixing wildcard version for "${pkg}" to ${version}`);
        packageJson.dependencies[pkg] = version;
        fixed = true;
      }
    });
  }
  
  // Write back the fixed package.json
  if (fixed) {
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ package.json fixed successfully!');
  } else {
    console.log('✅ package.json is already clean!');
  }
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
  // Don't exit with error - let npm install try anyway
  console.log('⚠️  Continuing anyway...');
}