import * as React from "react"
import * as ReactDOM from "react-dom/client"
import TreeDemo from './TreeDemo'
import { SharedState} from './shared-state/SharedState'

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render((
    <React.StrictMode>
      <SharedState />
      {/*<TreeDemo />*/}
    </React.StrictMode>
))
