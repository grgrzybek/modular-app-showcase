/**
 * VM Script Execution Tracer
 * 
 * This script monkey-patches vm.Script to trace all VM script creation
 * and execution. Useful for understanding how Jest and other tools
 * execute code in isolated contexts.
 * 
 * Usage:
 * 1. Add to your config file:
 *    require('./debug-helpers/vm-tracer')
 * 
 * 2. Or run with node:
 *    node -r ./debug-helpers/vm-tracer.js your-script.js
 */

const vm = require('vm')
const path = require('path')

const OriginalScript = vm.Script
const scriptLog = []

// Monkey-patch vm.Script
vm.Script = class TracedScript extends OriginalScript {
  constructor(code, options = {}) {
    const logEntry = {
      filename: options.filename || '<anonymous>',
      codeLength: code.length,
      codePreview: code.substring(0, 100).replace(/\n/g, '\\n'),
      displayErrors: options.displayErrors,
      lineOffset: options.lineOffset,
      columnOffset: options.columnOffset,
      createdAt: Date.now(),
      stackTrace: new Error().stack
    }
    
    scriptLog.push(logEntry)
    
    console.log(`[VM] Creating script: ${path.relative(process.cwd(), logEntry.filename)}`)
    console.log(`  Code length: ${logEntry.codeLength} bytes`)
    console.log(`  Preview: ${logEntry.codePreview}...`)
    console.log()
    
    super(code, options)
    
    this.__logEntry = logEntry
  }
  
  runInContext(contextifiedObject, options) {
    console.log(`[VM] Running script: ${path.relative(process.cwd(), this.__logEntry.filename)}`)
    
    const startTime = Date.now()
    try {
      const result = super.runInContext(contextifiedObject, options)
      const duration = Date.now() - startTime
      
      console.log(`  Execution time: ${duration}ms`)
      console.log(`  Success: true`)
      console.log()
      
      this.__logEntry.executionTime = duration
      this.__logEntry.success = true
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      console.error(`  Execution time: ${duration}ms`)
      console.error(`  Success: false`)
      console.error(`  Error: ${error.message}`)
      console.log()
      
      this.__logEntry.executionTime = duration
      this.__logEntry.success = false
      this.__logEntry.error = error.message
      
      throw error
    }
  }
  
  runInThisContext(options) {
    console.log(`[VM] Running script in this context: ${path.relative(process.cwd(), this.__logEntry.filename)}`)
    
    const startTime = Date.now()
    try {
      const result = super.runInThisContext(options)
      const duration = Date.now() - startTime
      
      console.log(`  Execution time: ${duration}ms`)
      console.log()
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      console.error(`  Execution time: ${duration}ms`)
      console.error(`  Error: ${error.message}`)
      console.log()
      
      throw error
    }
  }
  
  runInNewContext(contextObject, options) {
    console.log(`[VM] Running script in new context: ${path.relative(process.cwd(), this.__logEntry.filename)}`)
    
    const startTime = Date.now()
    try {
      const result = super.runInNewContext(contextObject, options)
      const duration = Date.now() - startTime
      
      console.log(`  Execution time: ${duration}ms`)
      console.log()
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      console.error(`  Execution time: ${duration}ms`)
      console.error(`  Error: ${error.message}`)
      console.log()
      
      throw error
    }
  }
}

// Also trace vm.runInContext, vm.runInThisContext, etc.
const originalRunInContext = vm.runInContext
vm.runInContext = function(code, contextifiedObject, options) {
  console.log('[VM] vm.runInContext called')
  console.log(`  Code length: ${code.length}`)
  return originalRunInContext.call(this, code, contextifiedObject, options)
}

const originalRunInThisContext = vm.runInThisContext
vm.runInThisContext = function(code, options) {
  console.log('[VM] vm.runInThisContext called')
  console.log(`  Code length: ${code.length}`)
  return originalRunInThisContext.call(this, code, options)
}

const originalRunInNewContext = vm.runInNewContext
vm.runInNewContext = function(code, contextObject, options) {
  console.log('[VM] vm.runInNewContext called')
  console.log(`  Code length: ${code.length}`)
  return originalRunInNewContext.call(this, code, contextObject, options)
}

// Export script log for inspection
global.__vmScriptLog = scriptLog

// Print summary on exit
process.on('exit', () => {
  console.log('\n=== VM Script Execution Summary ===')
  console.log(`Total scripts created: ${scriptLog.length}`)
  
  const executed = scriptLog.filter(s => s.executionTime !== undefined)
  console.log(`Scripts executed: ${executed.length}`)
  
  if (executed.length > 0) {
    const totalTime = executed.reduce((sum, s) => sum + s.executionTime, 0)
    const avgTime = totalTime / executed.length
    
    console.log(`Total execution time: ${totalTime}ms`)
    console.log(`Average execution time: ${avgTime.toFixed(2)}ms`)
    
    const failed = executed.filter(s => !s.success)
    if (failed.length > 0) {
      console.log(`\nFailed scripts: ${failed.length}`)
      failed.forEach(s => {
        console.log(`  ${path.relative(process.cwd(), s.filename)}: ${s.error}`)
      })
    }
    
    console.log('\nTop 5 slowest scripts:')
    executed
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 5)
      .forEach(s => {
        console.log(`  ${path.relative(process.cwd(), s.filename)}: ${s.executionTime}ms`)
      })
  }
})

console.log('[VM TRACER] VM script execution tracing enabled')
console.log('[VM TRACER] Access log via: global.__vmScriptLog\n')

// Made with Bob
