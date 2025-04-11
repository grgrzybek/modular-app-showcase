import * as React from "react"
import * as ReactDOM from "react-dom/client"

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render((
    <React.StrictMode>
      <h1>Hello!</h1>
      <p>This is the simpliest React application</p>
    </React.StrictMode>
))
