#!/usr/bin/env node

/**
 * Verification script to ensure no source maps are present in production build
 * This script scans the .next directory for any .map files and fails the build if found
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const BUILD_DIR = '.next';
const ALLOWED_PATTERNS: RegExp[] = [];

function findSourceMaps(dir: string, basePath: string = ''): string[] {
  const maps: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = join(basePath, entry);
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Recursively search subdirectories
          maps.push(...findSourceMaps(fullPath, relativePath));
        } else if (entry.endsWith('.map')) {
          // Check if this map file matches any allowed patterns
          const isAllowed = ALLOWED_PATTERNS.some(pattern => pattern.test(relativePath));
          if (!isAllowed) {
            maps.push(relativePath);
          }
        }
      } catch (err) {
        // Skip files we can't access
        continue;
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
    return maps;
  }
  
  return maps;
}

function main() {
  console.log('🔍 Checking for source maps in production build...\n');
  
  // Check if build directory exists
  if (!existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found!');
    console.error(`💡 Expected to find "${BUILD_DIR}" directory. Did the build complete successfully?\n`);
    process.exit(1);
  }
  
  const sourceMaps = findSourceMaps(BUILD_DIR);
  
  if (sourceMaps.length === 0) {
    console.log('✅ No source maps found - production bundle is secure!\n');
    process.exit(0);
  } else {
    console.error('❌ Source maps detected in production build:\n');
    sourceMaps.forEach(map => console.error(`  - ${map}`));
    console.error('\n⚠️  Source maps expose your code structure and should not be deployed to production.');
    console.error('💡 Ensure productionBrowserSourceMaps is disabled in next.config.mjs\n');
    process.exit(1);
  }
}

main();
