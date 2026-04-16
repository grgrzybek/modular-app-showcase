# Monorepo & Yarn Workspaces Guide

A comprehensive guide for working with monorepos, yarn workspaces, and debugging in VSCode when you're inside a workspace subdirectory.

## Your Monorepo Structure

```
modular-app-showcase/                    ← Root (where you ran yarn install)
├── package.json                         ← Defines workspaces
├── yarn.lock                            ← Single lock file for entire monorepo
├── node_modules/                        ← Shared node_modules (hoisted)
│   ├── jest/
│   ├── tsup/
│   ├── typescript/
│   └── ...
├── packages/
│   ├── learning-jest/                   ← YOU ARE HERE (current workspace)
│   │   ├── package.json                 ← Workspace package.json
│   │   ├── .vscode/launch.json          ← Your debug configs
│   │   ├── src/
│   │   └── node_modules/                ← ❌ Doesn't exist (hoisted to root)
│   └── other-package/
├── apps/
│   └── some-app/
└── plugins/
    └── some-plugin/
```

## Understanding Your Current Situation

### What You Asked About

> "I've run `bobide .` inside one of the workspaces"

**Answer:** Yes, I can only see files inside `/packages/learning-jest/` and below. I cannot access:
- ❌ Root `package.json` (but I just read it for you)
- ❌ Root `node_modules/`
- ❌ Other workspaces (`packages/other-package/`)
- ❌ Files outside the workspace

### Why No node_modules Here?

**Yarn Workspaces hoists dependencies to the root:**

```
Root package.json:
{
  "workspaces": ["packages/*", "apps/*"]
}

Workspace package.json (packages/learning-jest/package.json):
{
  "dependencies": {
    "jest": "^30.3.0"  ← Installed at root/node_modules/jest
  }
}
```

**Benefits:**
- ✅ Single `yarn install` for entire monorepo
- ✅ Shared dependencies (faster, less disk space)
- ✅ Consistent versions across workspaces
- ✅ Easier to manage

**Implications for debugging:**
- ⚠️ `node_modules/.bin/jest` is at `../../node_modules/.bin/jest`
- ⚠️ Breakpoints in node_modules need correct path
- ⚠️ VSCode might not find node_modules automatically

## Fixing Your launch.json for Monorepo

Your current launch.json uses:
```json
"args": [
  "${workspaceFolder}/node_modules/.bin/jest"  // ❌ Doesn't exist!
]
```

### Solution 1: Use Relative Path to Root

```json
{
  "name": "Debug Jest Tests (Monorepo)",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "node",
  "runtimeArgs": [
    "--inspect-brk",
    "--experimental-vm-modules",
    "--enable-source-maps"
  ],
  "args": [
    "${workspaceFolder}/../../node_modules/.bin/jest",  // ← Go up to root
    "--runInBand",
    "--no-cache",
    "--no-coverage"
  ],
  "cwd": "${workspaceFolder}",
  "console": "integratedTerminal",
  "skipFiles": [],
  "resolveSourceMapLocations": [
    "${workspaceFolder}/**",
    "${workspaceFolder}/../../node_modules/**"  // ← Root node_modules
  ]
}
```

### Solution 2: Use npx/yarn (Recommended)

```json
{
  "name": "Debug Jest Tests (Yarn)",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "yarn",  // ← Use yarn
  "runtimeArgs": [
    "jest",  // ← Yarn finds it automatically
    "--runInBand",
    "--no-cache"
  ],
  "console": "integratedTerminal",
  "cwd": "${workspaceFolder}",
  "skipFiles": []
}
```

**Why this works:**
- Yarn knows about the monorepo structure
- Automatically finds binaries in root node_modules
- Handles workspace resolution

### Solution 3: Define ${rootDir} Variable

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--inspect-brk", "--experimental-vm-modules"],
      "args": [
        "${workspaceFolder}/../../node_modules/.bin/jest",
        "--runInBand"
      ],
      "cwd": "${workspaceFolder}",
      "env": {
        "MONOREPO_ROOT": "${workspaceFolder}/../.."
      }
    }
  ]
}
```

## Detaching a Workspace from Monorepo

You asked: "How to detach one directory so it's not considered a workspace?"

### Method 1: Exclude from Workspaces Pattern

**Root package.json:**
```json
{
  "workspaces": [
    "packages/*",
    "!packages/learning-jest",  // ← Exclude this one
    "apps/*"
  ]
}
```

**Then run:**
```bash
cd packages/learning-jest
yarn install  # Creates local node_modules
```

**Result:**
```
packages/learning-jest/
├── package.json
├── node_modules/        ← Now exists locally!
│   ├── jest/
│   ├── tsup/
│   └── ...
└── yarn.lock            ← Optional: local lock file
```

### Method 2: Use nohoist (Yarn 1 only)

**Note:** Yarn 2+ (Berry) doesn't support nohoist. Use Method 1 or 3.

### Method 3: Move Outside Workspace Directories

```bash
# Move to a directory not matched by workspace patterns
mv packages/learning-jest learning-jest-standalone

# Or create a new top-level directory
mkdir standalone
mv packages/learning-jest standalone/
```

**Root package.json:**
```json
{
  "workspaces": [
    "packages/*",  // ← Doesn't match standalone/*
    "apps/*"
  ]
}
```

### Method 4: Create .yarnrc.yml Override

**In packages/learning-jest/.yarnrc.yml:**
```yaml
# This doesn't actually work to exclude from workspace
# But you can configure workspace-specific settings
```

**Better approach - use workspace protocol:**
```json
// Root package.json
{
  "workspaces": {
    "packages": ["packages/*"],
    "nohoist": ["**/learning-jest/**"]  // Yarn 1 only
  }
}
```

### Method 5: Use Different Package Manager

```bash
cd packages/learning-jest

# Remove yarn workspace link
rm -rf node_modules

# Use npm instead (ignores yarn workspaces)
npm install

# Or use pnpm
pnpm install
```

## Recommended Approach for Your Use Case

Since you want to **debug tooling internals**, I recommend:

### Option A: Keep as Workspace, Fix Paths

**Pros:**
- ✅ Maintains monorepo benefits
- ✅ Shared dependencies
- ✅ Easy to sync versions

**Cons:**
- ⚠️ Need to adjust paths in launch.json
- ⚠️ Slightly more complex debugging setup

**Implementation:**
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "yarn",  // ← Use yarn
      "runtimeArgs": ["jest", "--runInBand"],
      "cwd": "${workspaceFolder}",
      "skipFiles": [],
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "${workspaceFolder}/../../node_modules/**"  // ← Root node_modules
      ]
    }
  ]
}
```

### Option B: Detach for Learning

**Pros:**
- ✅ Simpler paths (local node_modules)
- ✅ Independent from monorepo
- ✅ Easier to experiment

**Cons:**
- ❌ Duplicate dependencies
- ❌ More disk space
- ❌ Separate yarn install needed

**Implementation:**
```bash
# 1. Exclude from workspaces
# Edit root package.json:
{
  "workspaces": [
    "packages/*",
    "!packages/learning-jest"
  ]
}

# 2. Install locally
cd packages/learning-jest
yarn install

# 3. Use simple launch.json
{
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--inspect-brk"],
      "args": [
        "${workspaceFolder}/node_modules/.bin/jest",  // ← Now exists!
        "--runInBand"
      ],
      "cwd": "${workspaceFolder}",
      "skipFiles": []
    }
  ]
}
```

## Updated launch.json for Monorepo

Here's a corrected version that works with your monorepo structure:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug tsup Build (Monorepo)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "yarn",
      "runtimeArgs": ["tsup", "--clean"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": [],
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "${workspaceFolder}/../../node_modules/**"
      ]
    },
    {
      "name": "Debug Jest Tests (Monorepo)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "yarn",
      "runtimeArgs": [
        "jest",
        "--runInBand",
        "--no-cache",
        "--no-coverage"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": [],
      "env": {
        "NODE_OPTIONS": "--inspect-brk --experimental-vm-modules --enable-source-maps"
      }
    },
    {
      "name": "Debug Jest Single Test (Monorepo)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "yarn",
      "runtimeArgs": [
        "jest",
        "${file}",
        "--runInBand",
        "--no-cache"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": [],
      "env": {
        "NODE_OPTIONS": "--inspect-brk --experimental-vm-modules"
      }
    },
    {
      "name": "Debug with Absolute Path (Monorepo)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "node",
      "runtimeArgs": [
        "--inspect-brk",
        "--experimental-vm-modules",
        "--enable-source-maps"
      ],
      "args": [
        "${workspaceFolder}/../../node_modules/.bin/jest",
        "--runInBand",
        "--no-cache"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": [],
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "${workspaceFolder}/../../node_modules/**"
      ]
    }
  ]
}
```

## VSCode Multi-Root Workspaces

For better monorepo support in VSCode:

### Create a Workspace File

**modular-app-showcase.code-workspace:**
```json
{
  "folders": [
    {
      "name": "Root",
      "path": "."
    },
    {
      "name": "learning-jest",
      "path": "packages/learning-jest"
    },
    {
      "name": "other-package",
      "path": "packages/other-package"
    }
  ],
  "settings": {
    "typescript.tsdk": "node_modules/typescript/lib",
    "eslint.workingDirectories": [
      "packages/learning-jest",
      "packages/other-package"
    ]
  },
  "launch": {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Debug Jest (learning-jest)",
        "type": "node",
        "request": "launch",
        "runtimeExecutable": "yarn",
        "runtimeArgs": ["workspace", "@showcase/learning-jest", "test"],
        "cwd": "${workspaceFolder:Root}",
        "console": "integratedTerminal"
      }
    ]
  }
}
```

**Open workspace:**
```bash
code modular-app-showcase.code-workspace
```

**Benefits:**
- ✅ See all workspaces in sidebar
- ✅ Shared settings
- ✅ Centralized launch configurations
- ✅ Better IntelliSense across workspaces

## Debugging Across Workspaces

### Scenario: Package A depends on Package B

```
packages/
├── package-a/
│   └── src/index.ts  (imports from @showcase/package-b)
└── package-b/
    └── src/utils.ts
```

**Debug configuration:**
```json
{
  "name": "Debug Package A (with Package B)",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/packages/package-a/src/index.ts",
  "cwd": "${workspaceFolder}",
  "skipFiles": [],
  "resolveSourceMapLocations": [
    "${workspaceFolder}/packages/**",
    "${workspaceFolder}/node_modules/**"
  ]
}
```

## Common Issues and Solutions

### Issue 1: "Cannot find module 'jest'"

**Cause:** VSCode looking in wrong node_modules

**Solution:**
```json
{
  "resolveSourceMapLocations": [
    "${workspaceFolder}/../../node_modules/**"  // ← Add root
  ]
}
```

### Issue 2: Breakpoints Not Hit in node_modules

**Cause:** Source maps not resolved

**Solution:**
```json
{
  "skipFiles": [],  // Don't skip anything
  "resolveSourceMapLocations": [
    "${workspaceFolder}/**",
    "${workspaceFolder}/../../node_modules/**",
    "!**/node_modules/react/**"  // Exclude specific packages
  ]
}
```

### Issue 3: "ENOENT: no such file or directory"

**Cause:** Wrong path to binary

**Solution:** Use yarn instead of direct path:
```json
{
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["jest"]  // Yarn finds it
}
```

### Issue 4: TypeScript Errors in VSCode

**Cause:** VSCode using wrong TypeScript version

**Solution:**
```json
// .vscode/settings.json (in workspace root)
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Best Practices

### 1. Use Yarn Commands in launch.json

```json
{
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["test"]  // Instead of direct paths
}
```

### 2. Set resolveSourceMapLocations Correctly

```json
{
  "resolveSourceMapLocations": [
    "${workspaceFolder}/**",                    // Current workspace
    "${workspaceFolder}/../../node_modules/**", // Root node_modules
    "${workspaceFolder}/../**"                  // Other workspaces
  ]
}
```

### 3. Use Multi-Root Workspace for Complex Monorepos

```bash
code modular-app-showcase.code-workspace
```

### 4. Document Monorepo Structure

```markdown
# README.md
## Monorepo Structure
- Root: Contains shared node_modules
- Workspaces: packages/*, apps/*
- To debug: Use yarn commands in launch.json
```

## Summary

### Your Current Situation
- ✅ You're in a workspace: `packages/learning-jest/`
- ✅ node_modules is at root: `../../node_modules/`
- ✅ I can only see files in current workspace
- ⚠️ Your launch.json needs path adjustments

### Recommended Solution
**Use yarn in launch.json:**
```json
{
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["jest", "--runInBand"]
}
```

### To Detach Workspace
**Edit root package.json:**
```json
{
  "workspaces": [
    "packages/*",
    "!packages/learning-jest"  // ← Exclude
  ]
}
```

**Then:**
```bash
cd packages/learning-jest
yarn install  # Creates local node_modules
```

### For Deep Debugging
Keep as workspace, use corrected launch.json with:
- `yarn` as runtimeExecutable
- Correct resolveSourceMapLocations
- NODE_OPTIONS for node flags

This gives you the best of both worlds: monorepo benefits + deep debugging capabilities!