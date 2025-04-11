import { Button, Masthead, MastheadMain, MastheadToggle, Page } from "@patternfly/react-core"
import { BarsIcon } from "@patternfly/react-icons"
import React, { ReactNode } from "react"

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
  return (
      <React.StrictMode>
        <Page mainContainerId={"app"} header={header}>
          {children}
        </Page>
      </React.StrictMode>
  )
}

export { Main }
