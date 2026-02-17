import './SharedState.css'
import * as React from 'react'

import { NodeSelectionContext, useNodeSelected } from './context'
import { OneLevelDeeper } from './OneLevelDeeper'

export const SharedState: React.FC = () => {

  // this is roughly an "include" option - whenever this is called, it's like calling useState()
  const { selectedNode, setSelectedNode } = useNodeSelected()

  return (
      <NodeSelectionContext.Provider value={{ selectedNode, setSelectedNode }}>
        <div className="container">
          <OneLevelDeeper />
        </div>
      </NodeSelectionContext.Provider>
  )

}
