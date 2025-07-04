import * as React from "react"

import { CodeEditor, Language } from "@patternfly/react-code-editor"
import { type EditorDidMount } from '@patternfly/react-code-editor/src/components/CodeEditor/CodeEditor'

export const TestEditor: React.FC = () => {

  const onMount: EditorDidMount = (editor, monaco) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  }

  return (
      <CodeEditor className="editor" language={Language.xml} isLineNumbersVisible={false} isMinimapVisible={false} height="400px"
                  onEditorDidMount={onMount}/>
  )

}
