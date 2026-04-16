# Example Debugging Session

This document walks through a practical debugging session to understand how Jest transforms and executes TypeScript code.

## Scenario: Debug How Jest Loads and Transforms a Test File

### Step 1: Prepare the Environment

1. Open VSCode in your project directory
2. Open the test file you want to debug: `src/services/connect-service.test.ts`
3. Open the Debug panel (Ctrl+Shift+D or Cmd+Shift+D)

### Step 2: Set Strategic Breakpoints

#### Breakpoint 1: Jest Runtime Module Loading
```
File: node_modules/jest-runtime/build/index.js
Method: requireModule
Line: Search for "requireModule(from, moduleName"
```

**What to observe:**
- `moduleName`: The module being imported
- `from`: The file doing the importing
- `this._moduleRegistry`: Cache of already loaded modules

#### Breakpoint 2: File Transformation
```
File: node_modules/jest-runtime/build/index.js
Method: transformFile
Line: Search for "transformFile(filename, options)"
```

**What to observe:**
- `filename`: File being transformed
- `content`: Original TypeScript content
- Return value: Transformed JavaScript code

#### Breakpoint 3: ts-jest Transformer
```
File: node_modules/ts-jest/dist/legacy/ts-jest-transformer.js
Method: process
Line: Search for "process(sourceText, sourcePath"
```

**What to observe:**
- `sourceText`: Original TypeScript
- `sourcePath`: File path
- `transformOptions`: Transformation options
- Return value: `{ code, map }` - transformed JS and source map

#### Breakpoint 4: VM Script Creation
```
File: node_modules/jest-runtime/build/index.js
Method: createScriptFromCode
Line: Search for "new (_vm || _load_vm()).Script"
```

**What to observe:**
- `scriptFilename`: File being executed
- `code`: Final JavaScript code
- VM context creation

### Step 3: Start Debugging

1. Select "Debug Jest Tests" from the debug configurations dropdown
2. Press F5 or click the green play button
3. The debugger will stop at `--inspect-brk`, waiting for you to continue

### Step 4: Navigate Through the Execution

#### First Stop: Test Discovery
- Jest scans for test files
- Observe how it finds `*.test.ts` files
- Check the test file list in `this._context.hasteFS`

#### Second Stop: Module Loading
When your breakpoint in `requireModule` is hit:

1. **Inspect the call stack** - See what triggered this module load
2. **Check `moduleName`** - Is it your test file or a dependency?
3. **Examine `this._moduleRegistry`** - See what's already loaded
4. **Step through** to see resolution logic

Example inspection in Debug Console:
```javascript
> moduleName
'./src/services/connect-service.test.ts'

> this._moduleRegistry.size
42

> Array.from(this._moduleRegistry.keys()).filter(k => k.includes('test'))
['./src/services/connect-service.test.ts']
```

#### Third Stop: Transformation
When your breakpoint in `transformFile` is hit:

1. **Inspect `content`** - Original TypeScript code
2. **Step into** the transformer call
3. **Watch the transformation** happen in ts-jest

Example inspection:
```javascript
> content.substring(0, 200)
'import { describe, it, expect } from "@jest/globals"\nimport { ConnectService } from "./connect-service"\n\ndescribe("ConnectService", () => {\n  it("should create instance", () => {\n    const service = new'

> filename
'/path/to/src/services/connect-service.test.ts'
```

#### Fourth Stop: ts-jest Processing
When in ts-jest transformer:

1. **Observe TypeScript compilation**
2. **Check compiler options** in `this._compilerOptions`
3. **See AST transformation** (if you added custom transformers)
4. **Inspect generated code** in return value

Example inspection:
```javascript
> this._compilerOptions.target
99 // ES2020

> this._compilerOptions.module
99 // ESNext

> sourceText.includes('import')
true

> // After transformation
> result.code.includes('require')
true // Imports converted to requires for Jest
```

#### Fifth Stop: VM Script Creation
When in `createScriptFromCode`:

1. **Inspect final JavaScript code**
2. **See the wrapper code** Jest adds
3. **Observe VM context** creation
4. **Watch script execution**

Example inspection:
```javascript
> code.substring(0, 200)
'"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nconst globals_1 = require("@jest/globals");\nconst connect_service_1 = require("./connect-service");\n(0, globals_1.describe)("ConnectService"'

> scriptFilename
'/path/to/src/services/connect-service.test.ts'

> // Check the context
> Object.keys(context)
['console', 'require', 'module', 'exports', '__dirname', '__filename', 'global', ...]
```

### Step 5: Understanding the Flow

The complete flow you just observed:

```
1. Jest CLI starts
   ↓
2. Test files discovered
   ↓
3. Test file imported (requireModule)
   ↓
4. Check if transformation needed
   ↓
5. Read source file
   ↓
6. Call ts-jest transformer
   ↓
7. TypeScript → JavaScript
   ↓
8. Generate source map
   ↓
9. Create VM Script
   ↓
10. Execute in isolated context
   ↓
11. Test runs
```

### Step 6: Advanced Inspection

#### Inspect Module Cache
```javascript
// In Debug Console when stopped in jest-runtime
> this._moduleRegistry.size
> Array.from(this._moduleRegistry.keys())
> this._moduleRegistry.get('./src/services/connect-service.ts')
```

#### Inspect Transformation Cache
```javascript
// In ts-jest transformer
> this._transformCfgStr
> this._tsResolvedModulesCachePath
```

#### Inspect Source Maps
```javascript
// After transformation
> result.map.sources
> result.map.mappings
> JSON.stringify(result.map, null, 2)
```

### Step 7: Experiment

Try these experiments:

1. **Modify transformation options**
   - Change `target` in tsconfig.json
   - Observe different output

2. **Add console.log in transformer**
   - Edit `node_modules/ts-jest/dist/legacy/ts-jest-transformer.js`
   - Add logging to see every transformation

3. **Inspect AST**
   - Use the ast-logger.ts helper
   - See the TypeScript AST structure

4. **Test module resolution**
   - Use module-tracer.js
   - See how imports are resolved

## Common Debugging Patterns

### Pattern 1: Find Where a Module is Loaded
```javascript
// Set conditional breakpoint in requireModule:
moduleName.includes('my-module')
```

### Pattern 2: Debug Transformation Issues
```javascript
// Set breakpoint in transformFile
// Inspect content before and after transformation
// Check source map generation
```

### Pattern 3: Debug Import Resolution
```javascript
// Use module-tracer.js
// Or set breakpoint in Module._resolveFilename
// Watch resolution attempts
```

### Pattern 4: Debug VM Context Issues
```javascript
// Set breakpoint in createScriptFromCode
// Inspect context object
// Check what's available in the isolated scope
```

## Tips for Effective Debugging

1. **Use conditional breakpoints** - Only break when specific conditions are met
2. **Use logpoints** - Log without stopping execution
3. **Inspect call stack** - Understand the execution flow
4. **Use Debug Console** - Evaluate expressions in the current context
5. **Step strategically** - Step Over for high-level flow, Step Into for details
6. **Watch expressions** - Monitor variables as you step through code

## Troubleshooting

### Breakpoint Not Hit
- Check if the file path is correct
- Ensure source maps are enabled
- Try removing `skipFiles` from launch.json

### Can't See Variables
- Check if you're in the right scope
- Try evaluating in Debug Console
- Ensure source maps are working

### Debugger Disconnects
- Increase timeout in launch.json
- Check for syntax errors in code
- Ensure Node.js version compatibility

## Next Steps

After understanding Jest's transformation:

1. **Debug tsup** - See how esbuild transforms code
2. **Debug webpack** - Understand loader chains
3. **Compare approaches** - See how different tools solve the same problem
4. **Create custom transformers** - Build your own transformation logic

## Resources

- [Jest Architecture](https://jestjs.io/docs/architecture)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Node.js VM Documentation](https://nodejs.org/api/vm.html)
- [VSCode Debugging](https://code.visualstudio.com/docs/editor/debugging)