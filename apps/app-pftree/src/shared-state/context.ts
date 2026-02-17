import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { Node, Tree } from './tree'

export type NodeSelectionContext = {
  selectedNode: Node
  setSelectedNode: React.Dispatch<React.SetStateAction<Node>>
}

export const NodeSelectionContext = createContext<NodeSelectionContext>({
  selectedNode: null,
  setSelectedNode: () => {}
})

export function useNodeSelected() {
  const [ selectedNode, setSelectedNode ] = useState<Node>(null)
  return { selectedNode, setSelectedNode }
}

export type TreeContext = {
  tree: Tree
  selectedNode: Node
  setSelectedNode: React.Dispatch<React.SetStateAction<Node>>
  expandedNodes: string[]
  setExpandedNodes: React.Dispatch<React.SetStateAction<string[]>>
}

export const TreeContext = createContext<TreeContext>({
  tree: undefined,
  selectedNode: null,
  setSelectedNode: () => {},
  expandedNodes: [],
  setExpandedNodes: () => {}
})

export function useTree() {
  // useContext() is NOT useNodeSelected(). useContext() is used to "reference" the state set by
  // <NodeSelectionContext.Provider>
  const { selectedNode, setSelectedNode } = useContext(NodeSelectionContext)
  const [ expandedNodes, setExpandedNodes ] = useState<string[]>([])
  const [ tree, setTree ] = useState<Tree>(undefined)

  useEffect(() => {
    const handle = setTimeout(() => {
      const tree = new Tree()
      const make = (prefix: string, depth: number): Node[] => {
        if (depth === 0) {
          return undefined
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
