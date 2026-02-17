import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Node, Tree } from './tree'

// ---- NodeSelectionContext

// just a type describing the shared data
export type NodeSelectionContext = {
  selectedNode?: Node
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | undefined>>
}

// it's good to create a context with "undefined", ...
export const NodeSelectionContext = createContext<NodeSelectionContext | undefined>(undefined)

// ...so we can create a hook like this for "using" the context - referencing the shared state
export function useNodeSelectionContext(): NodeSelectionContext {
  const ctx = useContext(NodeSelectionContext)
  if (!ctx) {
    throw new Error('Call useNodeSelectionContext() only within <NodeSelectionContext.Provider>')
  }
  return ctx
}

// this hook "creates" the state of the context to be "provided" by <NodeSelectionContext.Provider>
export function useNodeSelected() {
  const [ selectedNode, setSelectedNode ] = useState<Node | undefined>(undefined)
  return { selectedNode, setSelectedNode }
}

// ---- TreeContext

export type TreeContext = {
  tree?: Tree
  selectedNode?: Node
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | undefined>>
  expandedNodes: string[]
  setExpandedNodes: React.Dispatch<React.SetStateAction<string[]>>
}

export const TreeContext = createContext<TreeContext | undefined>(undefined)

export function useTreeContext(): TreeContext {
  const ctx = useContext(TreeContext)
  if (!ctx) {
    throw new Error('Call useTreeContext() only within <TreeContext.Provider>')
  }
  return ctx
}

export function useTree() {
  const { selectedNode, setSelectedNode } = useNodeSelectionContext()
  const [ expandedNodes, setExpandedNodes ] = useState<string[]>([])
  const [ tree, setTree ] = useState<Tree | undefined>(undefined)

  useEffect(() => {
    const handle = setTimeout(() => {
      const tree = new Tree()
      const make = (prefix: string, depth: number): Node[] => {
        if (depth === 0) {
          return []
        }
        const res: Node[] = []
        for (let i = 0; i < 2; i++) {
          const n: Node = new Node(`${prefix}-${i+1}`)
          res.push(n)
          n.children = make(n.id, depth - 1)
        }
        return res
      }
      tree.nodes = make('n', 4)
      setTree(tree)
    }, 800)
    return () => {
      clearTimeout(handle)
    }
  }, [])

  return { tree, selectedNode, setSelectedNode, expandedNodes, setExpandedNodes }
}
