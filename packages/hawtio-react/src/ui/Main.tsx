import { Button, Masthead, MastheadMain, MastheadToggle, Page } from "@patternfly/react-core"
import { BarsIcon } from "@patternfly/react-icons"
import React, { ReactNode } from "react"
import "./Main.css"

type Props = { children: ReactNode }

const Main: React.FunctionComponent<Props> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const header = (
      <Masthead>
        <MastheadToggle>
          <Button variant="plain" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Global navigation">
            <BarsIcon/>
          </Button>
        </MastheadToggle>
        <MastheadMain>Hawtio React experiments</MastheadMain>
      </Masthead>
  )
  const boxed: ReactNode[] = !Array.isArray(children)
      ? [ <div className="component-wrapper" key="k0">{children}</div> ]
      : children.map((c, idx) => (<div className="component-wrapper" key={"k" + idx}>{c}</div>));

  return (
      <React.StrictMode>
        <Page mainContainerId={"app"} header={header}>
          {boxed}
        </Page>
      </React.StrictMode>
  )
}

export { Main }
