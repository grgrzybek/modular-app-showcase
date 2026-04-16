# JavaScript Tooling Debugging Cheat Sheet

Quick reference for debugging webpack, tsup, and jest internals.

## Quick Start Commands

```bash
# Debug Jest tests
node --inspect-brk ./node_modules/.bin/jest --runInBand --no-cache

# Debug tsup build
node --inspect-brk ./node_modules/.bin/tsup --clean

# Debug with module tracing
node --inspect-brk -r ./debug-helpers/module-tracer.js ./node_modules/.bin/jest

# Debug with VM tracing
node --inspect-brk -r ./debug-helpers/vm-tracer.js ./node_modules/.bin/jest

# Enable Node.js debug output
NODE_DEBUG=module,loader node script.js
```

## VSCode Launch Configurations

Already configured in `.vscode/launch.json`:
- **Debug tsup Build** - Debug tsup compilation
- **Debug Jest Tests** - Debug all tests
- **Debug Jest Single Test** - Debug currently open test file
- **Attach to Node Process** - Attach to running process

## Critical Breakpoint Locations

### Jest / ts-jest

| File | Method | What to Observe |
|------|--------|-----------------|
| `node_modules/jest-runtime/build/index.js` | `requireModule()` | Module loading, cache |
| `node_modules/jest-runtime/build/index.js` | `transformFile()` | File transformation |
| `node_modules/jest-runtime/build/index.js` | `createScriptFromCode()` | VM script creation |
| `node_modules/ts-jest/dist/legacy/ts-jest-transformer.js` | `process()` | TS → JS transformation |
| `node_modules/@jest/transform/build/ScriptTransformer.js` | `transformSource()` | Transformer orchestration |

### tsup / esbuild

| File | Method | What to Observe |
|------|--------|-----------------|
| `node_modules/tsup/dist/cli-default.js` | `build()` | Build orchestration |
| `node_modules/esbuild/lib/main.js` | `build()` | esbuild API call |
| Your `tsup.config.ts` | Plugin `setup()` | Plugin initialization |
| Your `tsup.config.ts` | Plugin `onLoad()` | File loading |
| Your `tsup.config.ts` | Plugin `onResolve()` | Module resolution |

### Webpack

| File | Method | What to Observe |
|------|--------|-----------------|
| `node_modules/webpack/lib/Compiler.js` | `compile()` | Compilation start |
| `node_modules/webpack/lib/Compilation.js` | `buildModule()` | Module building |
| `node_modules/webpack/lib/Compilation.js` | `seal()` | Compilation finalization |
| `node_modules/loader-runner/lib/LoaderRunner.js` | `runLoaders()` | Loader execution |
| `node_modules/ts-loader/dist/index.js` | Main function | TypeScript loading |

### Node.js Internals

| Module | File | What to Observe |
|--------|------|-----------------|
| ESM Loader | `lib/internal/modules/esm/loader.js` | ESM module loading |
| CJS Loader | `lib/internal/modules/cjs/loader.js` | CommonJS loading |
| VM | `lib/vm.js` | Script execution |
| Module | `lib/module.js` | Module system |

## Key Variables to Inspect

### In jest-runtime

```javascript
// Module loading
modulePath              // Path to module
this._moduleRegistry    // Module cache
this._resolver          // Module resolver

// Transformation
filename                // File being transformed
content                 // Original content
fileSource              // Transformed content
instrument              // Coverage instrumentation flag

// VM execution
scriptFilename          // Script file name
code                    // Final JavaScript
context                 // VM context object
```

### In ts-jest

```javascript
// Transformation
sourceText              // Original TypeScript
sourcePath              // File path
transformOptions        // Transform options
this._compilerOptions   // TypeScript compiler options

// Output
result.code             // Transformed JavaScript
result.map              // Source map
```

### In webpack

```javascript
// Compilation
compilation.modules     // All modules
compilation.chunks      // Code chunks
compilation.assets      // Output assets

// Module
module.resource         // File path
module.dependencies     // Dependencies
module.blocks           // Async chunks

// Loader
this.resourcePath       // Current file
this.loaders            // Loader chain
this.loaderIndex        // Current position
```

## Debug Console Commands

### Inspect Module Cache
```javascript
// Jest
this._moduleRegistry.size
Array.from(this._moduleRegistry.keys())
this._moduleRegistry.get('./src/index.ts')

// Node.js
require.cache
Object.keys(require.cache)
```

### Inspect Transformation
```javascript
// Before transformation
content.substring(0, 200)

// After transformation
result.code.substring(0, 200)

// Source map
JSON.stringify(result.map, null, 2)
```

### Inspect AST
```javascript
// TypeScript
sourceFile.statements.length
sourceFile.statements[0].kind
ts.SyntaxKind[sourceFile.statements[0].kind]

// Babel
ast.program.body.length
ast.program.body[0].type
```

### Inspect Module Graph
```javascript
// Webpack
compilation.modules.size
Array.from(compilation.modules).map(m => m.resource)
module.dependencies.map(d => d.request)
```

## Conditional Breakpoints

```javascript
// Break only for specific files
filename.includes('my-module')

// Break only for specific modules
moduleName === './src/index.ts'

// Break only on errors
error !== null

// Break after N iterations
hitCount > 10

// Break for external modules
!moduleName.startsWith('.')
```

## Common Debugging Scenarios

### Scenario: Module Not Found
1. Set breakpoint in `Module._resolveFilename`
2. Inspect `request` and `parent.filename`
3. Check resolution paths
4. Verify file extensions

### Scenario: Transformation Error
1. Set breakpoint in transformer `process()`
2. Inspect `sourceText`
3. Check `transformOptions`
4. Verify TypeScript config

### Scenario: Source Map Issues
1. Enable source maps in all configs
2. Check `sourcemap: true` in tsup.config.ts
3. Verify `sourceMap: true` in jest config
4. Inspect generated `.map` files

### Scenario: Import/Export Issues
1. Use module-tracer.js
2. Set breakpoint in module resolution
3. Check module format (ESM vs CJS)
4. Verify package.json `type` field

## Helper Scripts Usage

### Module Tracer
```bash
# Add to config
require('./debug-helpers/module-tracer')

# Or use with -r flag
node -r ./debug-helpers/module-tracer.js script.js

# Access log
global.__moduleResolutionLog
```

### VM Tracer
```bash
# Add to config
require('./debug-helpers/vm-tracer')

# Or use with -r flag
node -r ./debug-helpers/vm-tracer.js script.js

# Access log
global.__vmScriptLog
```

### AST Logger
```typescript
// In jest.config.ts
transform: {
  "^.*\\.tsx?$": ["ts-jest", {
    astTransformers: {
      before: ['./debug-helpers/ast-logger.ts']
    }
  }]
}

// Access log
global.__astLog
global.__printASTSummary()
```

## Useful Node.js Flags

```bash
--inspect-brk              # Break before user code starts
--inspect-brk=0.0.0.0:9229 # Listen on all interfaces
--enable-source-maps       # Enable source map support
--experimental-vm-modules  # Enable ESM in VM
--max-old-space-size=4096  # Increase memory limit
--trace-warnings           # Show warning stack traces
--trace-deprecation        # Show deprecation stack traces
NODE_DEBUG=module          # Debug module loading
NODE_DEBUG=loader          # Debug ESM loader
```

## VSCode Debugging Tips

### Keyboard Shortcuts
- `F5` - Start/Continue
- `F10` - Step Over
- `F11` - Step Into
- `Shift+F11` - Step Out
- `Ctrl+Shift+F5` - Restart
- `Shift+F5` - Stop

### Debug Panel Features
- **Variables** - Inspect current scope
- **Watch** - Monitor expressions
- **Call Stack** - See execution path
- **Breakpoints** - Manage breakpoints
- **Debug Console** - Evaluate expressions

### Breakpoint Types
- **Regular** - Stop at line
- **Conditional** - Stop when condition is true
- **Logpoint** - Log without stopping
- **Function** - Stop at function entry

## Performance Profiling

```bash
# Generate CPU profile
node --inspect --cpu-prof ./node_modules/.bin/jest

# Generate heap snapshot
node --inspect --heap-prof ./node_modules/.bin/jest

# Use Chrome DevTools
node --inspect ./node_modules/.bin/jest
# Open chrome://inspect
```

## Troubleshooting

### Breakpoint Not Hit
- ✓ Check file path is correct
- ✓ Ensure source maps enabled
- ✓ Remove `skipFiles` from launch.json
- ✓ Verify code is actually executed

### Can't See Variables
- ✓ Check current scope
- ✓ Use Debug Console
- ✓ Verify source maps working
- ✓ Try stepping to different location

### Debugger Disconnects
- ✓ Increase timeout
- ✓ Check for syntax errors
- ✓ Verify Node.js version
- ✓ Check memory limits

### Source Maps Not Working
- ✓ Enable in all configs
- ✓ Check `.map` files exist
- ✓ Verify paths in source map
- ✓ Use `--enable-source-maps`

## Quick Reference Links

- [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md) - Full guide
- [example-debug-session.md](./example-debug-session.md) - Walkthrough
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [VSCode Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

## Pro Tips

1. **Start with high-level breakpoints** - Entry points first
2. **Use conditional breakpoints** - Reduce noise
3. **Inspect call stack** - Understand flow
4. **Use Debug Console** - Experiment with code
5. **Read the source** - Tools are well-documented
6. **Create minimal reproductions** - Isolate issues
7. **Use helper scripts** - Automate tracing
8. **Take notes** - Document your findings
9. **Compare tools** - Learn from differences
10. **Be patient** - Understanding takes time

---

**Remember:** The goal is not just to fix bugs, but to understand how these tools work internally. Happy debugging! 🐛🔍