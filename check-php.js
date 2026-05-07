#!/usr/bin/env node

/**
 * Cross-platform PHP linter
 * Finds all .php files in the api directory and validates syntax
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function findPhpFiles(dir) {
  const files = []
  const walk = (d) => {
    fs.readdirSync(d).forEach((f) => {
      const fullPath = path.join(d, f)
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath)
      } else if (f.endsWith('.php')) {
        files.push(fullPath)
      }
    })
  }
  walk(dir)
  return files
}

try {
  const phpFiles = findPhpFiles('api')
  console.log(`Checking ${phpFiles.length} PHP files...`)
  
  let errors = 0
  for (const file of phpFiles) {
    try {
      execSync(`php -l "${file}"`, { stdio: 'pipe' })
      console.log(`✓ ${file}`)
    } catch (e) {
      const msg = e.stdout?.toString() || e.message || ''
      if (msg.includes('not recognized') || msg.includes('command not found')) {
        console.warn('⚠ PHP not found in PATH - skipping PHP syntax check')
        process.exit(0)
      }
      console.error(`✗ ${file}`)
      console.error(msg)
      errors++
    }
  }
  
  if (errors > 0) {
    console.error(`\n${errors} file(s) failed PHP syntax check`)
    process.exit(1)
  }
  
  console.log('All PHP files passed syntax check')
  process.exit(0)
} catch (e) {
  console.error('Error:', e.message)
  process.exit(1)
}
