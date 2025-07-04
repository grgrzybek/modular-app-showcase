import * as React from "react"
import * as ReactDOM from "react-dom/client"
// import * as monaco from "monaco-editor"
import { TestEditor } from './ui/TestEditor'

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render((
    <React.StrictMode>
      <h1>Hello!</h1>
      <TestEditor />
    </React.StrictMode>
))

// monaco.editor.create(document.getElementById("editor"), {
//   value: ["function x() {", "\tconsole.log(\"Hello world!\");", "}"].join("\n"),
//   language: "javascript"
// })
