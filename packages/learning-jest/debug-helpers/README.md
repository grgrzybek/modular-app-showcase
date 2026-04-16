# Debug Helpers

This directory contains tools and guides for debugging JavaScript tooling internals.

## 📚 Documentation

### Main Guides
- **[../DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md)** - Comprehensive debugging guide covering webpack, tsup, and jest
- **[example-debug-session.md](./example-debug-session.md)** - Step-by-step walkthrough of a real debugging session
- **[CHEATSHEET.md](./CHEATSHEET.md)** - Quick reference for common debugging tasks

## 🛠️ Helper Scripts

### 1. Module Tracer (`module-tracer.js`)

Traces all Node.js module resolution attempts.

**Usage:**
```bash
# Method 1: Require in your config
# jest.config.ts or webpack.config.js
require('./debug-helpers/module-tracer')

# Method 2: Use -r flag
node -r ./debug-helpers/module-tracer.js ./node_modules/.bin/jest

# Method 3: Use with npm scripts
NODE_OPTIONS="-r ./debug-helpers/module-tracer.js" npm test
```

**Output:**
```
[MODULE] react
  From: src/index.ts
  To:   node_modules/react/index.js

[MODULE] ./utils
  From: src/index.ts
  To:   src/utils.ts
```

**Access log programmatically:**
```javascript
global.__moduleResolutionLog
```

### 2. VM Tracer (`vm-tracer.js`)

Traces all VM script creation and execution (useful for Jest).

**Usage:**
```bash
# Method 1: Require in config
require('./debug-helpers/vm-tracer')

# Method 2: Use -r flag
node -r ./debug-helpers/vm-tracer.js ./node_modules/.bin/jest
```

**Output:**
```
[VM] Creating script: src/index.test.ts
  Code length: 1234 bytes
  Preview: import { describe, it } from '@jest/globals'...

[VM] Running script: src/index.test.ts
  Execution time: 45ms
  Success: true
```

**Access log programmatically:**
```javascript
global.__vmScriptLog
```

### 3. AST Logger (`ast-logger.ts`)

Logs TypeScript AST nodes during transformation.

**Usage with ts-jest:**
```typescript
// jest.config.ts
import type { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.*\\.tsx?$": ["ts-jest", {
      astTransformers: {
        before: ['./debug-helpers/ast-logger.ts']
      }
    }]
  }
}

export default config
```

**Usage with tsup:**
```typescript
// tsup.config.ts
import { defineConfig } from "tsup"
import { createASTLogger } from "./debug-helpers/ast-logger"

export default defineConfig({
  entry: { index: "src/index.ts" },
  esbuildPlugins: [createASTLogger()]
})
```

**Output:**
```
[AST] Transforming: src/index.ts
  Statements: 15
  [IMPORT] 'react'
  [IMPORT] './utils'
  [FUNCTION] MyComponent
  [EXPORT] ExportDeclaration
  Summary:
    Imports: 2
    Exports: 1
    Functions: 1
    Classes: 0
```

**Access log programmatically:**
```javascript
global.__astLog
global.__printASTSummary()
```

## 🚀 Quick Start

### Debug Jest Tests

1. **Open VSCode** in your project
2. **Open Debug panel** (Ctrl+Shift+D / Cmd+Shift+D)
3. **Select** "Debug Jest Tests" from dropdown
4. **Press F5** to start debugging

### Debug tsup Build

1. **Open VSCode** in your project
2. **Open Debug panel**
3. **Select** "Debug tsup Build" from dropdown
4. **Press F5** to start debugging

### Set Breakpoints

**For Jest:**
```
node_modules/jest-runtime/build/index.js
  → requireModule() method
  → transformFile() method
  → createScriptFromCode() method
```

**For tsup:**
```
node_modules/tsup/dist/cli-default.js
  → build() function

Your tsup.config.ts
  → Plugin setup() method
  → onLoad() callbacks
```

## 📖 Learning Path

### Beginner
1. Read [CHEATSHEET.md](./CHEATSHEET.md) for quick reference
2. Follow [example-debug-session.md](./example-debug-session.md) walkthrough
3. Try debugging a simple test with "Debug Jest Tests"

### Intermediate
1. Read [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md) sections on Jest and tsup
2. Use helper scripts (module-tracer, vm-tracer)
3. Set breakpoints in jest-runtime and ts-jest
4. Inspect module cache and transformation

### Advanced
1. Read full [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md)
2. Debug Node.js internals (remove skipFiles)
3. Create custom transformers
4. Debug webpack loader chains
5. Inspect AST transformations

## 🎯 Common Use Cases

### Understanding Module Resolution
```bash
# Use module tracer
node -r ./debug-helpers/module-tracer.js ./node_modules/.bin/jest

# Or set breakpoint in Node.js
# File: node_modules/module/lib/internal/modules/cjs/loader.js
# Method: Module._resolveFilename
```

### Understanding TypeScript Transformation
```bash
# Set breakpoints in ts-jest
# File: node_modules/ts-jest/dist/legacy/ts-jest-transformer.js
# Method: process()

# Or use AST logger
# Add to jest.config.ts as shown above
```

### Understanding VM Execution
```bash
# Use VM tracer
node -r ./debug-helpers/vm-tracer.js ./node_modules/.bin/jest

# Or set breakpoint
# File: node_modules/jest-runtime/build/index.js
# Method: createScriptFromCode()
```

### Understanding Code Splitting
```bash
# Debug webpack
# Set breakpoint in:
# File: node_modules/webpack/lib/Compilation.js
# Method: seal()
```

## 🔧 Configuration

### VSCode Launch Configurations

Already configured in `../.vscode/launch.json`:

- **Debug tsup Build** - Debug tsup with source maps
- **Debug tsup Build (with node_modules)** - Include node_modules in debugging
- **Debug Jest Tests** - Debug all tests
- **Debug Jest Single Test** - Debug currently open test file
- **Debug Jest (Skip node_internals)** - Skip Node.js internals
- **Attach to Node Process** - Attach to running process
- **Debug npm test** - Debug via npm script
- **Debug npm build** - Debug build via npm script

### Recommended Settings

Add to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false
  }
}
```

Add to your `jest.config.ts`:
```typescript
{
  cache: false,  // Disable cache for debugging
  verbose: true  // Enable verbose output
}
```

Add to your `tsup.config.ts`:
```typescript
{
  sourcemap: true  // Enable source maps
}
```

## 💡 Tips

1. **Start simple** - Debug your own code first, then dive into tooling
2. **Use conditional breakpoints** - Break only when specific conditions are met
3. **Inspect call stack** - Understand the execution flow
4. **Use Debug Console** - Evaluate expressions in current context
5. **Read the source** - Tool source code is often well-documented
6. **Take notes** - Document your findings
7. **Be patient** - Understanding internals takes time

## 🐛 Troubleshooting

### Breakpoint Not Hit
- Check file path is correct
- Ensure source maps are enabled
- Remove `skipFiles` from launch.json
- Verify code is actually executed

### Can't See Variables
- Check if you're in the right scope
- Use Debug Console to evaluate
- Verify source maps are working
- Try stepping to a different location

### Debugger Disconnects
- Increase timeout in launch.json
- Check for syntax errors
- Verify Node.js version compatibility
- Check memory limits

### Source Maps Not Working
- Enable in all configs (tsconfig, jest, tsup)
- Check `.map` files are generated
- Verify paths in source map
- Use `--enable-source-maps` flag

## 📚 Additional Resources

### Documentation
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [VSCode Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Jest Architecture](https://jestjs.io/docs/architecture)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - For Node.js debugging
- [AST Explorer](https://astexplorer.net/) - Visualize AST
- [Source Map Visualization](https://sokra.github.io/source-map-visualization/)

### Source Code
- [Node.js](https://github.com/nodejs/node)
- [Jest](https://github.com/jestjs/jest)
- [ts-jest](https://github.com/kulshekhar/ts-jest)
- [tsup](https://github.com/egoist/tsup)
- [esbuild](https://github.com/evanw/esbuild)
- [webpack](https://github.com/webpack/webpack)

## 🤝 Contributing

Feel free to add more helper scripts or improve existing ones!

### Ideas for New Helpers
- Babel transformation tracer
- Webpack loader chain visualizer
- Source map validator
- Performance profiler
- Memory leak detector

---

**Happy Debugging!** 🐛🔍

If you have questions or find issues, refer to the main [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md) or [CHEATSHEET.md](./CHEATSHEET.md).