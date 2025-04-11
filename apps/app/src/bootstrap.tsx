import React from "react"
import ReactDOM from "react-dom/client"

import { Main } from "@showcase/hawtio-react"

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render(
    <Main>
      <span id="c1">Hello!</span>
      <span>Hello!</span>
    </Main>
)
