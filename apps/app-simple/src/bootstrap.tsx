import * as React from "react"
import * as ReactDOM from "react-dom/client"

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render((
    <React.StrictMode>
      <h1>Hello!</h1>
      <p>This is the simpliest React application</p>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 5rem)', gap: '1rem', margin: '1rem 0' }}>
        <div className='item'>i1</div>
        <div className='item with-background'>i2</div>
        <div className='item'>i3</div>
      </div>
    </React.StrictMode>
))
