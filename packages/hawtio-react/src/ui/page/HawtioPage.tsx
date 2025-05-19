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

import React, { ReactNode } from "react"

import { Button, Masthead, MastheadMain, MastheadToggle, Page } from "@patternfly/react-core"
import { BarsIcon } from "@patternfly/react-icons"

/**
 * This component accepts child components using two methods:
 * * as `children` rendered directly
 * * as `components` which are component functions which have to be _called_ using:
 * ```javascript
 * {components.map((C, idx) => (<C key={idx} />))}
 * ```
 * `components` was an attempt to fix a problem caused by `NavLink` being rendered outside of `BrowserRouter` - even
 * if the issue was caused by duplicate loading of `react-router` module.
 *
 * @param children
 * @param components
 * @constructor
 */
const MainPage: React.FunctionComponent<{children: ReactNode, components: React.FC[]}> = ({ children, components = [] }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  console.info("Rendering <MainPage />")

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

  const array = !Array.isArray(children) ? [ children ] : children
  const boxed: ReactNode[] = array.map((c, idx) => (<div className="component-wrapper" key={"k" + idx}>{c}</div>));

  return (
      <Page mainContainerId={"app"} header={header}>
        {boxed}
        {components.map((C, idx) => (<C key={idx} />))}
      </Page>
  )
}

export { MainPage }
