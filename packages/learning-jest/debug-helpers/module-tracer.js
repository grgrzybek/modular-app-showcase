/**
 * Module Resolution Tracer
 * 
 * This script monkey-patches Node.js Module._resolveFilename to trace
 * all module resolution attempts. Useful for understanding how imports
 * are resolved.
 * 
 * Usage:
 * 1. Add to your config file (jest.config.ts, webpack.config.js, etc.):
 *    require('./debug-helpers/module-tracer')
 * 
 * 2. Or run with node:
 *    node -r ./debug-helpers/module-tracer.js your-script.js
 */

const Module = require('module')
const path = require('path')

const originalResolveFilename = Module._resolveFilename

// Track resolution attempts
const resolutionLog = []

Module._resolveFilename = function(request, parent, isMain, options) {
  const parentPath = parent?.filename || '<root>'
  
  try {
    const result = originalResolveFilename.call(this, request, parent, isMain, options)
    
    const logEntry = {
      request,
      parent: parentPath,
      resolved: result,
      isMain,
      timestamp: Date.now()
    }
    
    resolutionLog.push(logEntry)
    
    // Log to console (comment out if too verbose)
    console.log(`[MODULE] ${request}`)
    console.log(`  From: ${path.relative(process.cwd(), parentPath)}`)
    console.log(`  To:   ${path.relative(process.cwd(), result)}`)
    console.log()
    
    return result
  } catch (error) {
    console.error(`[MODULE ERROR] Failed to resolve: ${request}`)
    console.error(`  From: ${parentPath}`)
    console.error(`  Error: ${error.message}`)
    console.log()
    throw error
  }
}

// Export resolution log for inspection
global.__moduleResolutionLog = resolutionLog

// Print summary on exit
process.on('exit', () => {
  console.log('\n=== Module Resolution Summary ===')
  console.log(`Total resolutions: ${resolutionLog.length}`)
  
  // Group by parent
  const byParent = {}
  resolutionLog.forEach(entry => {
    if (!byParent[entry.parent]) {
      byParent[entry.parent] = []
    }
    byParent[entry.parent].push(entry.request)
  })
  
  console.log(`\nUnique parent files: ${Object.keys(byParent).length}`)
  console.log('\nTop 10 files with most imports:')
  Object.entries(byParent)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .forEach(([parent, requests]) => {
      console.log(`  ${path.relative(process.cwd(), parent)}: ${requests.length} imports`)
    })
})

console.log('[MODULE TRACER] Module resolution tracing enabled')
console.log('[MODULE TRACER] Access log via: global.__moduleResolutionLog\n')

// Made with Bob
