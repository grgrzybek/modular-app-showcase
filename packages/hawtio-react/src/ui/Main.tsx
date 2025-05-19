/*
 * Copyright 2025 Grzegorz Grzybek
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
