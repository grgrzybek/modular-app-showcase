/**
 * TypeScript AST Logger
 * 
 * A TypeScript transformer that logs AST nodes during transformation.
 * Useful for understanding how TypeScript code is parsed and transformed.
 * 
 * Usage with ts-jest:
 * 
 * // jest.config.ts
 * transform: {
 *   "^.*\\.tsx?$": ["ts-jest", {
 *     astTransformers: {
 *       before: ['./debug-helpers/ast-logger.ts']
 *     }
 *   }]
 * }
 * 
 * Usage with tsup:
 * 
 * // tsup.config.ts
 * import { defineConfig } from "tsup"
 * import { createASTLogger } from "./debug-helpers/ast-logger"
 * 
 * export default defineConfig({
 *   esbuildPlugins: [createASTLogger()]
 * })
 */

import * as ts from 'typescript'

interface ASTLogEntry {
  file: string
  nodeKind: string
  nodeText: string
  line?: number
  column?: number
}

const astLog: ASTLogEntry[] = []

/**
 * TypeScript transformer factory for ts-jest
 */
export default function astLoggerTransformer(program: ts.Program) {
  return (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      console.log(`\n[AST] Transforming: ${sourceFile.fileName}`)
      console.log(`  Statements: ${sourceFile.statements.length}`)
      
      let importCount = 0
      let exportCount = 0
      let functionCount = 0
      let classCount = 0
      let interfaceCount = 0
      
      function visit(node: ts.Node): ts.Node {
        const kindName = ts.SyntaxKind[node.kind]
        
        // Log interesting nodes
        if (ts.isImportDeclaration(node)) {
          importCount++
          const moduleSpecifier = node.moduleSpecifier.getText(sourceFile)
          console.log(`  [IMPORT] ${moduleSpecifier}`)
          
          astLog.push({
            file: sourceFile.fileName,
            nodeKind: 'ImportDeclaration',
            nodeText: moduleSpecifier
          })
        }
        
        if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
          exportCount++
          console.log(`  [EXPORT] ${kindName}`)
          
          astLog.push({
            file: sourceFile.fileName,
            nodeKind: kindName,
            nodeText: node.getText(sourceFile).substring(0, 50)
          })
        }
        
        if (ts.isFunctionDeclaration(node)) {
          functionCount++
          const name = node.name?.getText(sourceFile) || '<anonymous>'
          console.log(`  [FUNCTION] ${name}`)
          
          astLog.push({
            file: sourceFile.fileName,
            nodeKind: 'FunctionDeclaration',
            nodeText: name
          })
        }
        
        if (ts.isClassDeclaration(node)) {
          classCount++
          const name = node.name?.getText(sourceFile) || '<anonymous>'
          console.log(`  [CLASS] ${name}`)
          
          astLog.push({
            file: sourceFile.fileName,
            nodeKind: 'ClassDeclaration',
            nodeText: name
          })
        }
        
        if (ts.isInterfaceDeclaration(node)) {
          interfaceCount++
          const name = node.name.getText(sourceFile)
          console.log(`  [INTERFACE] ${name}`)
          
          astLog.push({
            file: sourceFile.fileName,
            nodeKind: 'InterfaceDeclaration',
            nodeText: name
          })
        }
        
        if (ts.isCallExpression(node)) {
          const expression = node.expression.getText(sourceFile)
          if (expression === 'require' || expression === 'import') {
            console.log(`  [DYNAMIC ${expression.toUpperCase()}] ${node.arguments[0]?.getText(sourceFile)}`)
          }
        }
        
        return ts.visitEachChild(node, visit, ctx)
      }
      
      const result = ts.visitNode(sourceFile, visit) as ts.SourceFile
      
      console.log(`  Summary:`)
      console.log(`    Imports: ${importCount}`)
      console.log(`    Exports: ${exportCount}`)
      console.log(`    Functions: ${functionCount}`)
      console.log(`    Classes: ${classCount}`)
      console.log(`    Interfaces: ${interfaceCount}`)
      
      return result
    }
  }
}

/**
 * esbuild plugin for tsup
 */
export function createASTLogger() {
  return {
    name: 'ast-logger',
    setup(build: any) {
      console.log('[AST LOGGER] Plugin initialized')
      
      build.onLoad({ filter: /\.tsx?$/ }, async (args: any) => {
        console.log(`\n[AST] Loading: ${args.path}`)
        
        // Let default loader handle it, but log the event
        return null
      })
      
      build.onResolve({ filter: /.*/ }, (args: any) => {
        if (!args.path.startsWith('.') && !args.path.startsWith('/')) {
          // External module
          console.log(`[AST] Resolving external: ${args.path}`)
        } else {
          console.log(`[AST] Resolving local: ${args.path} from ${args.importer}`)
        }
        
        return null
      })
    }
  }
}

/**
 * Get the AST log for inspection
 */
export function getASTLog(): ASTLogEntry[] {
  return astLog
}

/**
 * Print AST log summary
 */
export function printASTSummary(): void {
  console.log('\n=== AST Transformation Summary ===')
  console.log(`Total nodes logged: ${astLog.length}`)
  
  const byFile = astLog.reduce((acc, entry) => {
    if (!acc[entry.file]) {
      acc[entry.file] = []
    }
    acc[entry.file].push(entry)
    return acc
  }, {} as Record<string, ASTLogEntry[]>)
  
  console.log(`Files transformed: ${Object.keys(byFile).length}`)
  
  const byKind = astLog.reduce((acc, entry) => {
    acc[entry.nodeKind] = (acc[entry.nodeKind] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  console.log('\nNode types:')
  Object.entries(byKind)
    .sort((a, b) => b[1] - a[1])
    .forEach(([kind, count]) => {
      console.log(`  ${kind}: ${count}`)
    })
}

// Export for use in Node.js
if (typeof global !== 'undefined') {
  ;(global as any).__astLog = astLog
  ;(global as any).__printASTSummary = printASTSummary
}

// For ts-jest compatibility
export const version = 1
export const factory = astLoggerTransformer

// Made with Bob
