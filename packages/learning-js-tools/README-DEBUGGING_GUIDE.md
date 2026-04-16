# Deep Debugging Guide: JavaScript Tooling Internals

A comprehensive guide to understanding how webpack, tsup, and jest transform TypeScript code through loaders and module systems.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Module Loading Pipeline](#understanding-the-module-loading-pipeline)
3. [Debugging Setup in VSCode](#debugging-setup-in-vscode)
4. [Debugging tsup (esbuild)](#debugging-tsup-esbuild)
5. [Debugging Jest with ts-jest](#debugging-jest-with-ts-jest)
6. [Debugging Webpack](#debugging-webpack)
7. [Key Breakpoint Locations](#key-breakpoint-locations)
8. [Advanced Techniques](#advanced-techniques)
9. [Common Debugging Scenarios](#common-debugging-scenarios)

---

## Prerequisites

### Required Knowledge
- Basic understanding of Node.js module system (CommonJS vs ESM)
- Familiarity with TypeScript compilation
- Understanding of source maps
- Basic knowledge of AST (Abstract Syntax Tree)

### Tools Setup
```bash
# Ensure you have these installed
npm install -D @types/node

# For inspecting node internals
node --version  # v18+ recommended for better ESM support
```

---

## Understanding the Module Loading Pipeline

### The Transformation Chain

```
┌─────────────┐
│ TypeScript  │
│   Source    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Loader    │ ← Webpack loader / ts-jest transformer / esbuild plugin
│  (Parser)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     AST     │ ← Abstract Syntax Tree (babel/typescript/esbuild)
│ Transform   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ JavaScript  │
│   Output    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Module    │ ← node:vm / require / import
│   System    │
└─────────────┘
```

### Key Node.js Modules Involved

1. **`node:vm`** - Virtual machine for running code in V8 contexts
2. **`node:module`** - Module resolution and loading
3. **`node:fs`** - File system operations for reading source
4. **`node:path`** - Path resolution for module imports

---

## Debugging Setup in VSCode

### 1. Create `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug tsup Build",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--inspect-brk",
        "--enable-source-maps"
      ],
      "args": [
        "${workspaceFolder}/node_modules/.bin/tsup",
        "--clean"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--inspect-brk",
        "--experimental-vm-modules",
        "--enable-source-maps"
      ],
      "args": [
        "${workspaceFolder}/node_modules/.bin/jest",
        "--runInBand",
        "--no-cache",
        "--no-coverage"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": []
    },
    {
      "name": "Debug Jest Single Test",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--inspect-brk",
        "--experimental-vm-modules"
      ],
      "args": [
        "${workspaceFolder}/node_modules/.bin/jest",
        "${file}",
        "--runInBand",
        "--no-cache"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Webpack Build",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--inspect-brk"
      ],
      "args": [
        "${workspaceFolder}/node_modules/.bin/webpack",
        "--mode=development"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "name": "Attach to Node Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": []
    }
  ]
}
```

### 2. Enable Source Maps in Your Configs

**tsup.config.ts** (already configured):
```typescript
export default defineConfig({
  sourcemap: true,  // ✓ Already enabled
  // ...
})
```

**jest.config.ts** - Add source map support:
```typescript
const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.*\\.tsx?$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        sourceMap: true,  // Enable source maps
        inlineSourceMap: false
      }
    }]
  },
  // ...
}
```

---

## Debugging tsup (esbuild)

### Understanding tsup's Architecture

tsup is a thin wrapper around esbuild (written in Go). The transformation happens in:
1. **JavaScript layer** (tsup) - Configuration and orchestration
2. **Native layer** (esbuild) - Actual parsing and transformation

### Key Files to Debug

#### 1. tsup Entry Point
```bash
# Location: node_modules/tsup/dist/cli-default.js
```

**Breakpoint locations:**
- Line where `build()` function is called
- Configuration parsing logic
- Plugin registration

#### 2. esbuild Plugin System
```bash
# Location: node_modules/esbuild/lib/main.js
```

**What to observe:**
- `build()` API call
- Plugin hooks execution order
- File resolution logic

### Debugging Session Example

```typescript
// Create a custom tsup plugin to observe the transformation
// File: tsup.config.ts

import { defineConfig } from "tsup"

export default defineConfig({
  entry: { index: "src/index.ts" },
  target: "esnext",
  format: "esm",
  sourcemap: true,
  
  // Add custom plugin to observe transformation
  esbuildPlugins: [
    {
      name: 'debug-loader',
      setup(build) {
        // Breakpoint here to see when plugin is initialized
        console.log('Plugin setup called')
        
        build.onLoad({ filter: /\.ts$/ }, async (args) => {
          // Breakpoint here to see each file being loaded
          console.log('Loading:', args.path)
          
          // You can inspect:
          // - args.path: file being loaded
          // - args.namespace: module namespace
          // - args.pluginData: data from previous plugins
          
          return null // Let default loader handle it
        })
        
        build.onResolve({ filter: /.*/ }, (args) => {
          // Breakpoint here to see module resolution
          console.log('Resolving:', args.path, 'from', args.importer)
          return null
        })
      }
    }
  ]
})
```

### Key Observations During Debugging

1. **Module Resolution**
   - Watch `args.importer` to see which file is importing
   - Watch `args.path` to see what's being imported
   - Observe how relative paths are resolved

2. **Transformation Pipeline**
   - esbuild parses TypeScript directly (no tsc involved)
   - Type checking is skipped (esbuild only strips types)
   - Source maps are generated inline or separately

3. **Output Generation**
   - Watch how chunks are split
   - Observe tree-shaking decisions
   - See how imports/exports are rewritten

---

## Debugging Jest with ts-jest

### Understanding Jest's Module Loading

Jest uses a custom module loader that intercepts `require()` and `import` statements.

### Architecture Overview

```
┌──────────────┐
│  Jest CLI    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Test Runner  │ ← jest-runner
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Runtime    │ ← jest-runtime (custom module loader)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Transformer  │ ← ts-jest (TypeScript → JavaScript)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   node:vm    │ ← Execute in isolated context
└──────────────┘
```

### Key Files to Debug

#### 1. Jest Runtime (Module Loader)
```bash
# Location: node_modules/jest-runtime/build/index.js
```

**Critical methods to breakpoint:**
- `requireModule()` - Main entry point for loading modules
- `requireModuleOrMock()` - Handles mocking logic
- `transformFile()` - Calls transformer (ts-jest)
- `createScriptFromCode()` - Creates VM script

#### 2. ts-jest Transformer
```bash
# Location: node_modules/ts-jest/dist/legacy/ts-jest-transformer.js
# Or: node_modules/ts-jest/dist/transformers/hoist-jest.js
```

**Critical methods:**
- `process()` - Main transformation entry point
- `getCacheKey()` - Cache invalidation logic
- TypeScript compiler API calls

#### 3. Node VM Module
```bash
# This is Node.js internal, but you can observe it
# Location: node:vm (internal module)
```

### Detailed Debugging Steps

#### Step 1: Set Up Jest for Deep Debugging

```typescript
// jest.config.ts
import type { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  
  // Disable cache to see fresh transformations
  cache: false,
  
  // Enable verbose logging
  verbose: true,
  
  transform: {
    "^.*\\.tsx?$": ["ts-jest", {
      // Enable diagnostics to see TypeScript compilation
      diagnostics: {
        pretty: true,
        warnOnly: false
      },
      
      // Custom transformer to add logging
      astTransformers: {
        before: [
          {
            path: './debug-transformer.js',
            options: {}
          }
        ]
      }
    }]
  }
}

export default config
```

#### Step 2: Create Debug Transformer

```javascript
// debug-transformer.js
module.exports = {
  version: 1,
  factory: (cs) => {
    return (ctx) => {
      return (sourceFile) => {
        // Breakpoint here to inspect AST
        console.log('Transforming:', sourceFile.fileName)
        
        // You can inspect:
        // - sourceFile.statements: All top-level statements
        // - sourceFile.imports: Import declarations
        // - sourceFile.exports: Export declarations
        
        return sourceFile // Return unchanged
      }
    }
  }
}
```

#### Step 3: Debug Session Workflow

1. **Start debugging** with "Debug Jest Tests" configuration
2. **Set breakpoints** in:
   ```
   node_modules/jest-runtime/build/index.js
   → requireModule() method (line ~500-600)
   → transformFile() method (line ~800-900)
   ```

3. **Observe the flow:**
   ```
   Test file import
   ↓
   Jest Runtime intercepts
   ↓
   Checks if transformation needed
   ↓
   Calls ts-jest transformer
   ↓
   TypeScript AST parsing
   ↓
   AST transformation
   ↓
   JavaScript code generation
   ↓
   Source map generation
   ↓
   VM script creation
   ↓
   Execution in isolated context
   ```

### Key Variables to Inspect

When stopped at breakpoints in jest-runtime:

```javascript
// In requireModule()
modulePath        // Path to module being loaded
options          // Loading options (isInternalModule, etc.)
this._moduleRegistry  // Cache of loaded modules

// In transformFile()
filename         // File being transformed
content          // Original TypeScript content
instrument       // Whether to add coverage instrumentation
fileSource       // Transformed JavaScript output

// In createScriptFromCode()
scriptFilename   // File name for VM
code            // Final JavaScript code
wrapperLength   // Wrapper code length (for source maps)
```

### Understanding the VM Context

```javascript
// Jest creates isolated VM contexts for each test file
// You can inspect this in jest-runtime

// Breakpoint in: node_modules/jest-runtime/build/index.js
// Method: createScriptFromCode()

const script = new vm.Script(code, {
  filename: scriptFilename,
  displayErrors: true,
})

// The script runs in a context with:
// - require: Custom require function
// - module: Module object
// - exports: Exports object
// - __dirname, __filename: Path info
// - global: Isolated global object
```

---

## Debugging Webpack

### Understanding Webpack's Loader System

Webpack uses a chain of loaders to transform files. Each loader is a function that receives source code and returns transformed code.

### Architecture Overview

```
┌─────────────┐
│   Webpack   │
│   Compiler  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Compilation │ ← Build process
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Module    │ ← Each file becomes a module
│  Factory    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Loader    │ ← ts-loader / babel-loader
│   Runner    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Parser    │ ← Acorn/Webpack parser
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Dependency  │ ← Extract imports/requires
│   Graph     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Chunks    │ ← Code splitting
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Assets    │ ← Final output files
└─────────────┘
```

### Sample Webpack Config for Debugging

```javascript
// webpack.config.js
const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  
  entry: './src/index.ts',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // Enable logging
              logLevel: 'info',
              
              // Custom transformer
              getCustomTransformers: () => ({
                before: [
                  // Add debug transformer here
                ]
              })
            }
          }
        ]
      }
    ]
  },
  
  // Add custom plugin to observe compilation
  plugins: [
    {
      apply(compiler) {
        // Breakpoint here to see compiler hooks
        compiler.hooks.compilation.tap('DebugPlugin', (compilation) => {
          console.log('Compilation started')
          
          compilation.hooks.buildModule.tap('DebugPlugin', (module) => {
            // Breakpoint here to see each module being built
            console.log('Building module:', module.resource)
          })
          
          compilation.hooks.succeedModule.tap('DebugPlugin', (module) => {
            // Breakpoint here to see successful module builds
            console.log('Module built:', module.resource)
          })
        })
      }
    }
  ]
}
```

### Key Files to Debug

#### 1. Webpack Compiler
```bash
# Location: node_modules/webpack/lib/Compiler.js
```

**Methods to breakpoint:**
- `compile()` - Start compilation
- `run()` - Run build process

#### 2. Webpack Compilation
```bash
# Location: node_modules/webpack/lib/Compilation.js
```

**Methods to breakpoint:**
- `buildModule()` - Build individual module
- `processModuleDependencies()` - Process imports
- `seal()` - Finalize compilation

#### 3. Loader Runner
```bash
# Location: node_modules/loader-runner/lib/LoaderRunner.js
```

**Methods to breakpoint:**
- `runLoaders()` - Execute loader chain
- `iteratePitchingLoaders()` - Pitching phase
- `iterateNormalLoaders()` - Normal phase

#### 4. ts-loader
```bash
# Location: node_modules/ts-loader/dist/index.js
```

**Methods to breakpoint:**
- Main loader function
- `getTypeScriptInstance()` - Get TS compiler
- `getEmit()` - Get compiled output

### Understanding Loader Execution

Webpack loaders execute in two phases:

1. **Pitching Phase** (right to left)
   ```
   loader3.pitch → loader2.pitch → loader1.pitch
   ```

2. **Normal Phase** (left to right)
   ```
   loader1 → loader2 → loader3
   ```

### Debugging Loader Chain

```javascript
// Create a debug loader
// File: debug-loader.js

module.exports = function(source) {
  // Breakpoint here to inspect:
  // - source: Input code
  // - this.resourcePath: File being loaded
  // - this.loaders: All loaders in chain
  // - this.loaderIndex: Current loader position
  
  console.log('Debug Loader')
  console.log('File:', this.resourcePath)
  console.log('Source length:', source.length)
  console.log('Loaders:', this.loaders.map(l => l.path))
  
  // Return source unchanged
  return source
}

// Add to webpack config:
// {
//   test: /\.tsx?$/,
//   use: ['debug-loader', 'ts-loader']
// }
```

### Observing Module Graph

```javascript
// In webpack plugin
compiler.hooks.compilation.tap('DebugPlugin', (compilation) => {
  compilation.hooks.finishModules.tap('DebugPlugin', (modules) => {
    // Breakpoint here to inspect all modules
    for (const module of modules) {
      console.log('Module:', module.resource)
      console.log('Dependencies:', module.dependencies.length)
      console.log('Blocks:', module.blocks.length)
      
      // Inspect dependencies
      for (const dep of module.dependencies) {
        console.log('  →', dep.request)
      }
    }
  })
})
```

---

## Key Breakpoint Locations

### Node.js Internals

To debug Node.js module loading itself, you need to:

1. **Clone Node.js source** (optional but helpful):
   ```bash
   git clone https://github.com/nodejs/node.git
   cd node
   git checkout v20.x  # or your version
   ```

2. **Key files in Node.js**:
   ```
   lib/internal/modules/esm/loader.js    # ESM loader
   lib/internal/modules/cjs/loader.js    # CommonJS loader
   lib/vm.js                              # VM module
   lib/internal/modules/esm/translators.js # Format translators
   ```

3. **Enable Node.js source debugging**:
   ```json
   // In launch.json, remove skipFiles
   "skipFiles": []
   ```

### Critical Breakpoints by Tool

#### tsup/esbuild
```
node_modules/tsup/dist/cli-default.js:
  - build() function call

node_modules/esbuild/lib/main.js:
  - build() API
  - transform() API

Your tsup.config.ts:
  - Plugin setup() method
  - onLoad() callbacks
  - onResolve() callbacks
```

#### Jest
```
node_modules/jest-runtime/build/index.js:
  - requireModule() (line ~500)
  - transformFile() (line ~800)
  - createScriptFromCode() (line ~1200)

node_modules/ts-jest/dist/legacy/ts-jest-transformer.js:
  - process() method
  - getCacheKey() method

node_modules/@jest/transform/build/ScriptTransformer.js:
  - transformSource() method
```

#### Webpack
```
node_modules/webpack/lib/Compiler.js:
  - compile() method
  - run() method

node_modules/webpack/lib/Compilation.js:
  - buildModule() method
  - seal() method

node_modules/loader-runner/lib/LoaderRunner.js:
  - runLoaders() function

node_modules/ts-loader/dist/index.js:
  - Main loader function
```

---

## Advanced Techniques

### 1. Inspecting AST Transformations

```typescript
// Create a TypeScript transformer to log AST
// File: ast-logger.ts

import * as ts from 'typescript'

export default function(program: ts.Program) {
  return (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      
      function visit(node: ts.Node): ts.Node {
        // Breakpoint here to inspect each AST node
        console.log('Node kind:', ts.SyntaxKind[node.kind])
        
        if (ts.isImportDeclaration(node)) {
          console.log('Import:', node.moduleSpecifier.getText())
        }
        
        if (ts.isFunctionDeclaration(node)) {
          console.log('Function:', node.name?.getText())
        }
        
        return ts.visitEachChild(node, visit, ctx)
      }
      
      return ts.visitNode(sourceFile, visit)
    }
  }
}
```

### 2. Tracing Module Resolution

```javascript
// Add to any config file
const Module = require('module')
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function(request, parent, isMain, options) {
  // Breakpoint here to see all module resolutions
  console.log('Resolving:', request)
  console.log('From:', parent?.filename)
  
  const result = originalResolveFilename.call(this, request, parent, isMain, options)
  console.log('Resolved to:', result)
  
  return result
}
```

### 3. Monitoring VM Script Execution

```javascript
// Monkey-patch vm.Script to observe execution
const vm = require('vm')
const OriginalScript = vm.Script

vm.Script = class extends OriginalScript {
  constructor(code, options) {
    // Breakpoint here to see all VM scripts being created
    console.log('Creating VM Script:', options?.filename)
    console.log('Code length:', code.length)
    super(code, options)
  }
  
  runInContext(context, options) {
    // Breakpoint here to see script execution
    console.log('Running script:', this.filename)
    return super.runInContext(context, options)
  }
}
```

### 4. Inspecting Source Maps

```javascript
// Install source-map package
// npm install source-map

const { SourceMapConsumer } = require('source-map')

async function inspectSourceMap(mapPath) {
  const fs = require('fs')
  const rawMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  
  const consumer = await new SourceMapConsumer(rawMap)
  
  // Breakpoint here to inspect mappings
  console.log('Sources:', consumer.sources)
  
  // Map a generated position to original
  const original = consumer.originalPositionFor({
    line: 10,
    column: 5
  })
  
  console.log('Original position:', original)
  
  consumer.destroy()
}
```

### 5. Debugging TypeScript Compiler API

```typescript
// Create a custom TypeScript compiler host
import * as ts from 'typescript'

const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json')
const configFile = ts.readConfigFile(configPath!, ts.sys.readFile)
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  './'
)

// Create custom compiler host
const host = ts.createCompilerHost(parsedConfig.options)

// Override methods to observe behavior
const originalGetSourceFile = host.getSourceFile
host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
  // Breakpoint here to see files being read
  console.log('Reading source file:', fileName)
  
  const sourceFile = originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
  
  if (sourceFile) {
    console.log('Statements:', sourceFile.statements.length)
  }
  
  return sourceFile
}

// Create program
const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, host)

// Emit
const emitResult = program.emit(undefined, (fileName, data) => {
  // Breakpoint here to see emitted files
  console.log('Emitting:', fileName)
  console.log('Content length:', data.length)
})
```

---

## Common Debugging Scenarios

### Scenario 1: Understanding How TypeScript is Transformed

**Goal:** See the exact transformation from TS to JS

**Steps:**
1. Set breakpoint in ts-jest transformer: `node_modules/ts-jest/dist/legacy/ts-jest-transformer.js` → `process()` method
2. Run Jest test in debug mode
3. Inspect variables:
   - `source`: Original TypeScript code
   - `transformedSource`: Transformed JavaScript
   - `sourceMap`: Generated source map

**What to observe:**
- Type annotations are stripped
- Imports are transformed (ESM → CommonJS or vice versa)
- JSX is transformed to React.createElement calls
- Decorators are transformed

### Scenario 2: Tracing Module Resolution

**Goal:** Understand how `import './module'` resolves to actual file

**Steps:**
1. Add module resolution tracer (see Advanced Techniques #2)
2. Set breakpoint in jest-runtime: `requireModule()` method
3. Inspect `modulePath` variable
4. Step through resolution logic

**What to observe:**
- How extensions are tried (.ts, .tsx, .js, .jsx)
- How index files are resolved
- How package.json exports are handled
- How node_modules are searched

### Scenario 3: Understanding Code Splitting

**Goal:** See how webpack splits code into chunks

**Steps:**
1. Configure webpack with code splitting:
   ```javascript
   optimization: {
     splitChunks: {
       chunks: 'all'
     }
   }
   ```
2. Set breakpoint in webpack Compilation: `seal()` method
3. Inspect `chunks` array
4. Observe chunk graph creation

**What to observe:**
- How modules are grouped into chunks
- How dependencies affect chunking
- How dynamic imports create split points

### Scenario 4: Debugging Source Map Issues

**Goal:** Fix incorrect source map mappings

**Steps:**
1. Enable source maps in all tools
2. Set breakpoint where error occurs
3. Check if debugger shows correct source location
4. If not, inspect source map:
   ```javascript
   const map = JSON.parse(fs.readFileSync('dist/index.js.map'))
   console.log('Sources:', map.sources)
   console.log('Mappings:', map.mappings)
   ```

**What to observe:**
- Source paths in source map
- Mapping accuracy
- Inline vs external source maps

### Scenario 5: Understanding VM Context Isolation

**Goal:** See how Jest isolates test environments

**Steps:**
1. Set breakpoint in jest-runtime: `createScriptFromCode()` method
2. Inspect `context` object
3. Step into `script.runInContext()`
4. Observe isolated global scope

**What to observe:**
- Custom `require` function
- Isolated `global` object
- Module cache per context
- How mocks are injected

---

## Tips and Tricks

### 1. Use Conditional Breakpoints

```javascript
// In VSCode, right-click breakpoint → Edit Breakpoint → Condition
// Example: Break only for specific files
filename.includes('my-module.ts')

// Example: Break only on errors
error !== null

// Example: Break after N iterations
hitCount > 10
```

### 2. Use Logpoints Instead of console.log

```javascript
// Right-click in gutter → Add Logpoint
// Example logpoint:
Loading {filename} with {loaders.length} loaders
```

### 3. Inspect Call Stack

When stopped at breakpoint:
- Check CALL STACK panel in VSCode
- Click frames to see context at each level
- Look for patterns in how functions are called

### 4. Watch Expressions

Add to WATCH panel:
```javascript
this.resourcePath           // Current file being processed
this.loaders.map(l => l.path)  // Loader chain
module.dependencies.length  // Number of dependencies
compilation.modules.size    // Total modules
```

### 5. Use Debug Console

While debugging, use Debug Console to:
```javascript
// Inspect variables
> this.resourcePath

// Call functions
> this.getOptions()

// Modify state (careful!)
> this.cacheable(false)
```

### 6. Enable Verbose Logging

```bash
# Jest
DEBUG=* npm test

# Webpack
npx webpack --progress --profile

# Node.js module loading
NODE_DEBUG=module node script.js
```

---

## Useful Resources

### Documentation
- [Node.js Modules Documentation](https://nodejs.org/api/modules.html)
- [Node.js VM Documentation](https://nodejs.org/api/vm.html)
- [Jest Architecture](https://jestjs.io/docs/architecture)
- [Webpack Loader API](https://webpack.js.org/api/loaders/)
- [esbuild Plugin API](https://esbuild.github.io/plugins/)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

### Tools
- [Source Map Visualization](https://sokra.github.io/source-map-visualization/)
- [AST Explorer](https://astexplorer.net/) - Visualize AST
- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Node.js Internals
- [Node.js Source Code](https://github.com/nodejs/node)
- [V8 Documentation](https://v8.dev/docs)

---

## Quick Reference: Common Commands

```bash
# Debug any npm script
node --inspect-brk ./node_modules/.bin/<command>

# Debug with specific Node flags
node --inspect-brk --experimental-vm-modules ./node_modules/.bin/jest

# Attach debugger to running process
node --inspect script.js
# Then in VSCode: Run → Attach to Node Process

# Enable Node.js debug output
NODE_DEBUG=module,loader node script.js

# Run with source map support
node --enable-source-maps script.js

# Increase memory for large projects
node --max-old-space-size=4096 ./node_modules/.bin/webpack
```

---

## Conclusion

Understanding JavaScript tooling internals requires patience and systematic debugging. Key takeaways:

1. **Use breakpoints strategically** - Focus on entry points and transformation functions
2. **Inspect the call stack** - Understand the flow of execution
3. **Watch key variables** - Track how data transforms through the pipeline
4. **Read the source** - Tool source code is often well-documented
5. **Experiment** - Create minimal reproductions to isolate behavior

The more you debug these tools, the better you'll understand:
- How modules are loaded and transformed
- How AST transformations work
- How source maps maintain the connection to original code
- How different tools solve similar problems differently

Happy debugging! 🐛🔍