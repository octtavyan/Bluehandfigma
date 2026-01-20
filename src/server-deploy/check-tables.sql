-- Check table structures to diagnose foreign key issue

-- Check if tables exist and their engines
SHOW TABLE STATUS WHERE Name IN ('paintings', 'sizes', 'painting_sizes');

-- Check paintings table structure
SHOW CREATE TABLE `paintings`;

-- Check sizes table structure  
SHOW CREATE TABLE `sizes`;
