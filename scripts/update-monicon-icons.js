const fs = require('fs');
const path = require('path');

/**
 * Recursively find all TypeScript/TSX files in a directory
 */
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (!['node_modules', '.git', 'build', 'dist', '.expo'].includes(file)) {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract icon names from file content
 */
function extractIcons(content) {
  const icons = new Set();

  // Pattern 1: name="mdi:icon-name" or name='mdi:icon-name' (direct assignment)
  const namePattern = /name\s*=\s*["']([^"']+)["']/g;
  let match;
  while ((match = namePattern.exec(content)) !== null) {
    const iconName = match[1];
    if (isIconifyIcon(iconName)) {
      icons.add(iconName);
    }
  }

  // Pattern 2: name={...} (conditional expressions and variables)
  // This catches: name={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'}
  const nameConditionalPattern = /name\s*=\s*\{[^}]*\}/g;
  while ((match = nameConditionalPattern.exec(content)) !== null) {
    const conditionalBlock = match[0];
    // Extract all icon strings from the conditional block
    const iconMatches = conditionalBlock.match(/["'](mdi:[^"']+|mage:[^"']+)["']/g);
    if (iconMatches) {
      iconMatches.forEach((iconMatch) => {
        const iconName = iconMatch.replace(/["']/g, '');
        if (isIconifyIcon(iconName)) {
          icons.add(iconName);
        }
      });
    }
  }

  // Pattern 3: icon: 'mdi:icon-name' or icon: "mdi:icon-name"
  const iconPattern = /icon:\s*["']([^"']+)["']/g;
  while ((match = iconPattern.exec(content)) !== null) {
    const iconName = match[1];
    if (isIconifyIcon(iconName)) {
      icons.add(iconName);
    }
  }

  // Pattern 4: Find all strings that look like iconify icons (mdi:xxx or mage:xxx)
  const allIconPattern = /["'](mdi:[^"']+|mage:[^"']+)["']/g;
  while ((match = allIconPattern.exec(content)) !== null) {
    const iconName = match[1];
    if (isIconifyIcon(iconName)) {
      icons.add(iconName);
    }
  }

  return icons;
}

/**
 * Check if a string is an iconify icon name
 */
function isIconifyIcon(str) {
  if (!str) return false;
  // Iconify icons typically have the format: prefix:icon-name
  // Common prefixes: mdi, mage, material-symbols, etc.
  return /^[a-z]+:[a-z0-9-]+$/i.test(str);
}

/**
 * Update metro.config.js with found icons
 */
function updateMetroConfig(icons) {
  const metroConfigPath = path.join(__dirname, '..', 'metro.config.js');
  let content = fs.readFileSync(metroConfigPath, 'utf8');

  // Extract existing icons from config to preserve them
  const existingIcons = new Set();
  // Find the icons array by looking for the pattern icons: [ ... ]
  const iconsArrayStart = content.indexOf('icons: [');
  if (iconsArrayStart !== -1) {
    let bracketCount = 0;
    let inString = false;
    let stringChar = '';
    let i = iconsArrayStart + 'icons: ['.length;
    
    // Find the matching closing bracket
    for (; i < content.length; i++) {
      const char = content[i];
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      } else if (!inString && char === '[') {
        bracketCount++;
      } else if (!inString && char === ']') {
        if (bracketCount === 0) {
          break;
        }
        bracketCount--;
      }
    }
    
    if (i < content.length) {
      const iconsArrayContent = content.substring(iconsArrayStart + 'icons: ['.length, i);
      const iconMatches = iconsArrayContent.match(/["']([^"']+)["']/g);
      if (iconMatches) {
        iconMatches.forEach((match) => {
          const iconName = match.replace(/["']/g, '').trim();
          if (iconName && isIconifyIcon(iconName)) {
            existingIcons.add(iconName);
          }
        });
      }
    }
  }

  // Merge found icons with existing icons
  const allIcons = new Set([...existingIcons, ...icons]);

  // Sort icons alphabetically
  const sortedIcons = Array.from(allIcons).sort();
  
  // Debug output
  if (existingIcons.size > 0) {
    console.log(`\n📋 Found ${existingIcons.size} existing icons in config`);
  }

  // Create the icons array string
  const iconsArray = sortedIcons
    .map((icon) => `    "${icon}"`)
    .join(',\n');

  // Replace the icons array in the config
  // Find the start and end of the icons array more reliably
  const iconsStart = content.indexOf('icons: [');
  if (iconsStart !== -1) {
    // Find the matching closing bracket
    let bracketCount = 0;
    let inString = false;
    let stringChar = '';
    let i = iconsStart + 'icons: ['.length;
    
    for (; i < content.length; i++) {
      const char = content[i];
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      } else if (!inString && char === '[') {
        bracketCount++;
      } else if (!inString && char === ']') {
        if (bracketCount === 0) {
          break;
        }
        bracketCount--;
      }
    }
    
    if (i < content.length) {
      // Replace the entire icons array
      const before = content.substring(0, iconsStart);
      const after = content.substring(i + 1);
      content = before + `icons: [\n${iconsArray},\n  ]` + after;
    }
  }

  fs.writeFileSync(metroConfigPath, content, 'utf8');
  
  const newIconsCount = icons.size;
  const totalIconsCount = sortedIcons.length;
  const preservedIconsCount = existingIcons.size - new Set([...existingIcons].filter(x => icons.has(x))).size;
  
  console.log(`✅ Updated metro.config.js with ${totalIconsCount} total icons`);
  console.log(`   - ${newIconsCount} newly found icons`);
  if (preservedIconsCount > 0) {
    console.log(`   - ${preservedIconsCount} preserved existing icons`);
  }
}

/**
 * Main function
 */
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const allIcons = new Set();

  console.log('🔍 Scanning for icon usage...\n');

  if (!fs.existsSync(srcDir)) {
    console.error('❌ src directory not found!');
    process.exit(1);
  }

  const tsFiles = findTsFiles(srcDir);
  console.log(`Found ${tsFiles.length} TypeScript files\n`);

  tsFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const icons = extractIcons(content);
    icons.forEach((icon) => allIcons.add(icon));
  });

  console.log(`Found ${allIcons.size} unique icons:\n`);
  const sortedIcons = Array.from(allIcons).sort();
  sortedIcons.forEach((icon) => console.log(`  - ${icon}`));

  console.log('\n📝 Updating metro.config.js...\n');
  updateMetroConfig(allIcons);

  console.log('\n✨ Done!');
}

main();

