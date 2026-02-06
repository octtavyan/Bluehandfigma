#!/bin/bash

echo "🔧 Running custom install script..."

# Fix package.json before npm even sees it
node fix-package.js

# Now run npm install
npm install --legacy-peer-deps

echo "✅ Installation complete!"
