const fs = require('fs');
const path = require('path');

// Color mappings
const colorMap = {
  '#86C2FF': '#6994FF',
  '#6FB0EE': '#5078E6',
  '#6BADEF': '#5078E6'
};

// Files to process
const files = [
  'components/admin/AdminLayout.tsx',
  'pages/ProductDetailPage.tsx',
  'pages/PersonalizedCanvasPage.tsx',
  'pages/CartPage.tsx',
  'pages/CheckoutPage.tsx',
  'pages/AdminLoginPage.tsx',
  'pages/admin/AdminDashboardPage.tsx',
  'pages/admin/AdminOrderDetailPage.tsx',
  'pages/admin/AdminPaintingsPage.tsx',
  'pages/admin/AdminSupabaseTestPage.tsx',
  'pages/TablouriCanvasPage.tsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all color codes
    Object.entries(colorMap).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, newColor);
    });
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Updated ${filePath}`);
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
});

console.log('\\nColor replacement complete!');
