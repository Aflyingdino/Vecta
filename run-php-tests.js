#!/usr/bin/env node

/**
 * Cross-platform PHP test runner
 * Skips gracefully if PHP is not available
 */

import { spawnSync } from 'child_process'

const result = spawnSync('php', ['tests/php/helpers_test.php'], {
  stdio: 'pipe',
  encoding: 'utf-8',
})

const output = (result.stdout || '') + (result.stderr || '')

// Check if PHP is not found
if (result.error || output.includes('not recognized') || output.includes('command not found')) {
  console.warn('⚠ PHP not found in PATH - skipping PHP tests')
  process.exit(0)
}

// If there's output, print it
if (output) {
  console.log(output)
}

process.exit(result.status || 0)
