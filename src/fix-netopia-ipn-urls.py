#!/usr/bin/env python3
"""
Auto-fix script to update all Netopia IPN URLs to public endpoint
Run this with: python3 fix-netopia-ipn-urls.py
"""

import re

# Read the file
with open('supabase/functions/server/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Count occurrences before
before_count = len(re.findall(r'/netopia/ipn(?!-public)', content))
print(f'Found {before_count} occurrences of /netopia/ipn (without -public)')

# Replace all occurrences
# This regex matches /netopia/ipn but NOT /netopia/ipn-public
content = re.sub(r'/netopia/ipn(?!-public)', '/netopia/ipn-public', content)

# Count occurrences after
after_count = len(re.findall(r'/netopia/ipn(?!-public)', content))
public_count = len(re.findall(r'/netopia/ipn-public', content))

print(f'\nAfter replacement:')
print(f'- /netopia/ipn (without -public): {after_count}')
print(f'- /netopia/ipn-public: {public_count}')

# Write back to file
with open('supabase/functions/server/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\n✅ File updated successfully!')
print(f'Updated {before_count} URLs to use public endpoint')
