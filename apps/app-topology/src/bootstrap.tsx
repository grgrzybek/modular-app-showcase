import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { SimpleGraphPage } from './ui/SimpleGraph'
import { D3Hello } from './ui/D3Hello'

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render((
    <React.StrictMode>
      <SimpleGraphPage />
      {/*<D3Hello />*/}
    </React.StrictMode>
))
