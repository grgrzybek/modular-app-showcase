import * as React from 'react'

import { TreeContext, useTree } from './context'
import { useContext } from 'react'
import { type Node } from './tree'

export const OneLevelDeeper: React.FC = () => {

  const { selectedNode, setSelectedNode, tree, expandedNodes, setExpandedNodes } = useTree()

  return (
      <TreeContext.Provider value={{ tree, selectedNode, setSelectedNode, expandedNodes, setExpandedNodes }}>
        <div className="left">
          <LeftPanel />
        </div>
        <div className="right">
          <RightPanel />
        </div>
      </TreeContext.Provider>
  )
}

const LeftPanel: React.FC = () => {
  const { tree } = useContext(TreeContext)
  if (!tree) {
    return (<span>not available yet</span>)
  }
  return <Tree nodes={tree.nodes} level={0} />
}

const RightPanel: React.FC = () => {
  const { selectedNode, expandedNodes } = useContext(TreeContext)

  return (<>
      <div>
        <span>Selected Node: {selectedNode ? selectedNode.id : 'none'}</span>
      </div>
      <div>
        <span>Expanded Nodes:</span>
        {expandedNodes && <ul>
          {expandedNodes.map(n => <li key={n}>{n}</li>)}
        </ul>}
      </div>
  </>)
}

const Tree: React.FC<{ nodes: Node[], level: number }> = ({ nodes, level }) => {
  const { selectedNode, setSelectedNode, setExpandedNodes } = useContext(TreeContext)

  const onSelect = (node: Node) => {
    node.selected = !node.selected
    if (selectedNode && selectedNode.id !== node.id) {
      selectedNode.selected = false
    }
    setSelectedNode(node.selected ? node : null)
  }
  const onExpand = (node: Node) => {
    node.expanded = !node.expanded
    setExpandedNodes((expanded) => {
      if (node.expanded) {
        // add
        return [ ...expanded, node.id ]
      } else {
        // remove
        return expanded.filter(id => id !== node.id)
      }
    })
  }
  return (<ul className={`l-${level}`}>
    {nodes.map((node) => (
        <li key={node.id}>
          <span className={`${node.selected ? 'selected' : ''}`}>
            {node.children ?
              <span className="expander" onClick={(ev) => {
                    ev.stopPropagation()
                    onExpand(node)
                  }}>
                {node.expanded ? '-' : '+'}
              </span> :
              <span className="no-expander" />
            }
            <span className="label" onClick={(ev) => {
              ev.stopPropagation()
              onSelect(node)
            }}>{node.id}</span>
          </span>
          {node.children && node.expanded && <Tree nodes={node.children} level={level + 1} />}
        </li>
    ))}
  </ul>)
}
