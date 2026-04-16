# VSCode launch.json Explained (for IntelliJ IDEA Users)

A comprehensive guide to understanding VSCode's debugging configuration, especially for developers coming from IntelliJ IDEA.

## TL;DR - Quick Comparison

| Feature | IntelliJ IDEA | VSCode |
|---------|---------------|--------|
| **Auto-detection** | ✅ Excellent (JUnit, main(), Maven, Gradle) | ⚠️ Limited (some extensions provide it) |
| **Configuration file** | `.idea/runConfigurations/*.xml` (optional) | `.vscode/launch.json` (optional but recommended) |
| **First-time setup** | Usually works out-of-the-box | Often requires manual configuration |
| **Sharing configs** | Can commit to git | Can commit to git |
| **UI for creation** | Excellent visual editor | Basic dropdown + JSON editing |

## Is launch.json Required?

**Short answer: No, but it's highly recommended for complex scenarios.**

### What Works Without launch.json

VSCode has some built-in debugging capabilities:

#### 1. Simple JavaScript/TypeScript Files
```bash
# You can just press F5 on a simple .js file
# VSCode will ask: "Node.js" or "Chrome"?
# Then it runs with default settings
```

#### 2. With Extensions
Some VSCode extensions provide auto-detection:

- **Jest Runner** extension - Adds "Run Test" / "Debug Test" buttons above test functions
- **Mocha Test Explorer** - Auto-detects Mocha tests
- **Python** extension - Auto-detects pytest, unittest
- **Java Extension Pack** - Similar to IDEA's auto-detection

#### 3. Using npm Scripts
```bash
# In package.json
"scripts": {
  "test": "jest",
  "build": "tsup"
}

# VSCode shows "Run" / "Debug" buttons above scripts
# Click "Debug" → it runs with debugger attached
```

### When You NEED launch.json

You need `launch.json` for:

1. **Custom Node.js flags** (like `--inspect-brk`, `--experimental-vm-modules`)
2. **Debugging node_modules** (requires `skipFiles: []`)
3. **Complex debugging scenarios** (attach to remote process, Docker, etc.)
4. **Environment variables** and custom working directories
5. **Multiple debug configurations** (different test suites, build modes)
6. **Deep debugging** (like debugging Jest/webpack internals)

## Understanding launch.json Structure

### Basic Anatomy

```json
{
  "version": "0.2.0",           // Schema version (always 0.2.0)
  "configurations": [           // Array of debug configurations
    {
      "name": "My Debug Config", // Name shown in dropdown
      "type": "node",            // Debugger type (node, chrome, python, etc.)
      "request": "launch",       // "launch" or "attach"
      // ... more settings
    }
  ]
}
```

### Configuration Types

#### 1. Launch Configuration
Starts a new process with debugger attached.

```json
{
  "name": "Debug Jest Tests",
  "type": "node",
  "request": "launch",          // ← Starts new process
  "runtimeExecutable": "node",  // What to run (node, npm, yarn)
  "args": [                     // Arguments to pass
    "${workspaceFolder}/node_modules/.bin/jest"
  ]
}
```

**Equivalent command line:**
```bash
node ${workspaceFolder}/node_modules/.bin/jest
```

#### 2. Attach Configuration
Attaches to an already-running process.

```json
{
  "name": "Attach to Node Process",
  "type": "node",
  "request": "attach",  // ← Attaches to existing process
  "port": 9229          // Debug port
}
```

**Usage:**
```bash
# Terminal 1: Start process with debugging
node --inspect-brk script.js

# VSCode: Select "Attach to Node Process" and press F5
```

## Detailed Explanation of Your launch.json

Let's break down each configuration in your file:

### Configuration 1: Debug tsup Build

```json
{
  "name": "Debug tsup Build",
  "type": "node",                    // Use Node.js debugger
  "request": "launch",               // Start new process
  "runtimeExecutable": "node",       // Run 'node' command
  "runtimeArgs": [                   // Flags for node itself
    "--inspect-brk",                 // Start debugger, break before code
    "--enable-source-maps"           // Enable source map support
  ],
  "args": [                          // Arguments after node
    "${workspaceFolder}/node_modules/.bin/tsup",
    "--clean"
  ],
  "cwd": "${workspaceFolder}",       // Working directory
  "console": "integratedTerminal",   // Use VSCode's terminal
  "skipFiles": [],                   // Don't skip any files (debug everything)
  "resolveSourceMapLocations": [     // Where to look for source maps
    "${workspaceFolder}/**",
    "!**/node_modules/**"            // Exclude node_modules
  ],
  "outputCapture": "std"             // Capture stdout/stderr
}
```

**Equivalent command:**
```bash
cd /path/to/workspace
node --inspect-brk --enable-source-maps ./node_modules/.bin/tsup --clean
```

**Why this configuration?**
- `--inspect-brk`: Breaks before any code runs, so you can set breakpoints
- `--enable-source-maps`: Maps compiled JS back to TypeScript
- `skipFiles: []`: Allows debugging into node_modules (tsup internals)
- `resolveSourceMapLocations`: Tells VSCode where source maps are

### Configuration 2: Debug tsup Build (with node_modules)

```json
{
  "name": "Debug tsup Build (with node_modules)",
  // ... same as above except:
  "resolveSourceMapLocations": [
    "${workspaceFolder}/**",
    "${workspaceFolder}/node_modules/**"  // ← Include node_modules
  ]
}
```

**Difference:** This version resolves source maps inside node_modules, allowing you to step into tsup's source code (if available).

### Configuration 3: Debug Jest Tests

```json
{
  "name": "Debug Jest Tests",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "node",
  "runtimeArgs": [
    "--inspect-brk",
    "--experimental-vm-modules",      // ← Required for Jest with ESM
    "--enable-source-maps"
  ],
  "args": [
    "${workspaceFolder}/node_modules/.bin/jest",
    "--runInBand",                    // Run tests serially (easier to debug)
    "--no-cache",                     // Don't use cached transforms
    "--no-coverage"                   // Skip coverage (faster)
  ],
  "cwd": "${workspaceFolder}",
  "console": "integratedTerminal",
  "skipFiles": [],                    // Debug everything, including Jest internals
  "outputCapture": "std"
}
```

**Equivalent command:**
```bash
node --inspect-brk --experimental-vm-modules --enable-source-maps \
  ./node_modules/.bin/jest --runInBand --no-cache --no-coverage
```

**Why these flags?**
- `--experimental-vm-modules`: Jest uses VM to run tests; this enables ESM support
- `--runInBand`: Runs tests in single process (parallel would spawn multiple processes)
- `--no-cache`: Forces fresh transformation (useful when debugging transformers)
- `skipFiles: []`: Lets you debug Jest's internals (jest-runtime, ts-jest, etc.)

### Configuration 4: Debug Jest Single Test

```json
{
  "name": "Debug Jest Single Test",
  // ... same as "Debug Jest Tests" except:
  "args": [
    "${workspaceFolder}/node_modules/.bin/jest",
    "${file}",                        // ← Currently open file
    "--runInBand",
    "--no-cache"
  ]
}
```

**Special variable:** `${file}` - Path to currently active file in editor

**Usage:**
1. Open a test file (e.g., `connect-service.test.ts`)
2. Select "Debug Jest Single Test"
3. Press F5
4. Only that test file runs

### Configuration 5: Debug Jest (Skip node_internals)

```json
{
  "name": "Debug Jest (Skip node_internals)",
  // ... same as "Debug Jest Tests" except:
  "skipFiles": [
    "<node_internals>/**"             // ← Skip Node.js internal files
  ]
}
```

**Difference:** Skips Node.js built-in modules (like `fs`, `path`, `vm`). Use this when you only want to debug your code and Jest, not Node.js itself.

### Configuration 6: Attach to Node Process

```json
{
  "name": "Attach to Node Process",
  "type": "node",
  "request": "attach",                // ← Attach, not launch
  "port": 9229,                       // Default Node.js debug port
  "skipFiles": [],
  "sourceMaps": true,
  "localRoot": "${workspaceFolder}",
  "remoteRoot": null
}
```

**Usage scenario:**
```bash
# Terminal: Start your app with debugging
node --inspect script.js
# or
npm run dev  # if it uses --inspect

# VSCode: Select "Attach to Node Process" and press F5
```

**When to use:**
- Debugging long-running processes
- Debugging processes started by other tools
- Debugging in Docker containers
- Debugging remote Node.js processes

### Configuration 7: Debug npm test

```json
{
  "name": "Debug npm test",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "npm",         // ← Run npm, not node
  "runtimeArgs": [
    "run-script",
    "test"
  ],
  "port": 9229,
  "skipFiles": [],
  "console": "integratedTerminal"
}
```

**Equivalent command:**
```bash
npm run-script test
```

**Note:** This runs `npm test` with debugger. However, npm needs to pass `--inspect-brk` to node. Better approach:

```json
// package.json
"scripts": {
  "test": "jest",
  "test:debug": "node --inspect-brk ./node_modules/.bin/jest"
}
```

Then use:
```json
{
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run-script", "test:debug"]
}
```

### Configuration 8: Debug npm build

```json
{
  "name": "Debug npm build",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "npm",
  "runtimeArgs": [
    "run-script",
    "build"
  ],
  "port": 9229,
  "skipFiles": [],
  "console": "integratedTerminal"
}
```

**Equivalent command:**
```bash
npm run-script build
```

Same note as above - better to create a `build:debug` script.

## VSCode Variables Reference

VSCode provides several variables you can use in launch.json:

| Variable | Description | Example |
|----------|-------------|---------|
| `${workspaceFolder}` | Root folder of workspace | `/home/user/project` |
| `${workspaceFolderBasename}` | Workspace folder name | `project` |
| `${file}` | Currently open file | `/home/user/project/src/index.ts` |
| `${fileBasename}` | Current file name | `index.ts` |
| `${fileBasenameNoExtension}` | File name without extension | `index` |
| `${fileDirname}` | Directory of current file | `/home/user/project/src` |
| `${cwd}` | Current working directory | `/home/user/project` |
| `${lineNumber}` | Current line number | `42` |
| `${selectedText}` | Selected text in editor | `const x = 5` |
| `${env:NAME}` | Environment variable | `${env:HOME}` |

## Creating launch.json - Step by Step

### Method 1: VSCode UI (Easiest)

1. Open Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
2. Click "create a launch.json file"
3. Select environment (Node.js, Chrome, etc.)
4. VSCode creates basic configuration
5. Customize as needed

### Method 2: Command Palette

1. Press Ctrl+Shift+P / Cmd+Shift+P
2. Type "Debug: Open launch.json"
3. Select environment
4. Edit configuration

### Method 3: Manual Creation

1. Create `.vscode/launch.json` in project root
2. Copy configuration from examples
3. Customize for your needs

## Comparison with IntelliJ IDEA

### IntelliJ IDEA Approach

```xml
<!-- .idea/runConfigurations/Debug_Jest.xml -->
<component name="ProjectRunConfigurationManager">
  <configuration name="Debug Jest" type="NodeJSConfigurationType">
    <node-interpreter>$PROJECT_DIR$/node</node-interpreter>
    <node-parameters>--inspect-brk</node-parameters>
    <working-directory>$PROJECT_DIR$</working-directory>
    <javascript-file>node_modules/.bin/jest</javascript-file>
    <parameters>--runInBand</parameters>
  </configuration>
</component>
```

**IDEA advantages:**
- ✅ Auto-detects test frameworks (JUnit, TestNG, Jest, Mocha)
- ✅ "Run" gutter icons next to tests
- ✅ Visual configuration editor
- ✅ Template-based configurations
- ✅ Shared configurations in project

**VSCode advantages:**
- ✅ Simpler JSON format (easier to edit)
- ✅ More flexible (can run any command)
- ✅ Better for custom tooling
- ✅ Lighter weight

### Auto-Detection Comparison

**IntelliJ IDEA:**
```java
// IDEA automatically detects this as runnable
public class MyTest {
    @Test
    public void testSomething() {
        // Right-click → Run 'testSomething()'
        // or click green arrow in gutter
    }
}
```

**VSCode:**
```typescript
// Requires Jest Runner extension for gutter icons
describe('MyTest', () => {
  it('should test something', () => {
    // With extension: "Run" / "Debug" appears above
    // Without extension: Use launch.json configuration
  })
})
```

## Best Practices

### 1. Commit launch.json to Git

```bash
# .gitignore - DON'T ignore .vscode/
# .vscode/
# ✅ DO commit it for team consistency
```

**Why?** Team members get same debug configurations.

### 2. Create Multiple Configurations

```json
{
  "configurations": [
    { "name": "Debug All Tests" },
    { "name": "Debug Current Test" },
    { "name": "Debug Integration Tests" },
    { "name": "Debug Unit Tests" },
    { "name": "Debug with Coverage" }
  ]
}
```

### 3. Use Compounds for Complex Scenarios

```json
{
  "configurations": [
    { "name": "Debug Backend", "type": "node", ... },
    { "name": "Debug Frontend", "type": "chrome", ... }
  ],
  "compounds": [
    {
      "name": "Debug Full Stack",
      "configurations": ["Debug Backend", "Debug Frontend"]
    }
  ]
}
```

### 4. Document Your Configurations

```json
{
  "configurations": [
    {
      "name": "Debug Jest Tests",
      // This configuration debugs Jest tests with:
      // - ESM support (--experimental-vm-modules)
      // - No cache (--no-cache) for fresh transforms
      // - Serial execution (--runInBand) for easier debugging
      "type": "node",
      // ...
    }
  ]
}
```

## Extensions That Help

### 1. Jest Runner
- Adds "Run" / "Debug" buttons above tests
- Similar to IDEA's gutter icons
- Install: `ms-vscode.vscode-jest-runner`

### 2. JavaScript Debugger (built-in)
- Auto-attach to Node.js processes
- Settings → "Debug: Node Auto Attach" → "on"

### 3. Test Explorer UI
- Unified test UI for multiple frameworks
- Tree view of all tests
- Install: `hbenl.vscode-test-explorer`

## Alternatives to launch.json

### 1. Use npm Scripts with Debug Flag

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:debug": "node --inspect-brk ./node_modules/.bin/jest --runInBand"
  }
}
```

Then in terminal:
```bash
npm run test:debug
# VSCode will prompt: "Auto attach to Node.js process?"
```

### 2. Use VSCode's JavaScript Debug Terminal

1. Open Command Palette (Ctrl+Shift+P)
2. "Debug: JavaScript Debug Terminal"
3. Run any command - debugger auto-attaches!

```bash
# In JavaScript Debug Terminal
npm test        # Automatically debugs!
node script.js  # Automatically debugs!
```

**This is the closest to IDEA's experience!**

### 3. Use Extension-Provided Configurations

Some extensions add debug configurations automatically:
- Jest extension
- Mocha extension
- Python extension

## Summary

| Scenario | Do You Need launch.json? | Alternative |
|----------|-------------------------|-------------|
| Simple script debugging | ❌ No | Press F5, select Node.js |
| Jest tests (basic) | ❌ No | Use Jest Runner extension |
| Jest tests (deep debugging) | ✅ Yes | Need custom Node.js flags |
| Debugging node_modules | ✅ Yes | Need `skipFiles: []` |
| Custom build tools | ✅ Yes | Need specific arguments |
| Team consistency | ✅ Yes | Share configurations |
| Multiple debug scenarios | ✅ Yes | Multiple configurations |

## Conclusion

**For your use case (debugging Jest/tsup/webpack internals):**

✅ **You NEED launch.json** because:
1. You need custom Node.js flags (`--inspect-brk`, `--experimental-vm-modules`)
2. You want to debug into node_modules (`skipFiles: []`)
3. You need specific Jest flags (`--runInBand`, `--no-cache`)
4. You want to debug transformation internals

**Without launch.json:**
- You could run `npm test` with debugger
- But you couldn't easily debug into Jest/ts-jest internals
- You couldn't control Node.js flags
- You couldn't skip/include specific files

**Think of launch.json as:**
- IntelliJ's "Run Configurations" but in JSON
- More manual but more flexible
- Required for advanced debugging scenarios
- Optional for simple "run this file" scenarios

The configurations I created give you the same level of control you have in IntelliJ IDEA, but with the flexibility to debug deep into the tooling internals!