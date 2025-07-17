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

import React, { type ReactNode } from "react"
import { BrowserRouter, Route, Routes } from 'react-router'

import "@src/ui/Main.css"

import { HawtioPage } from "@src/ui/page/HawtioPage"
import { HawtioLogin } from "@src/ui/auth/HawtioLogin"
import { AppProvider } from "@src/ui/context"

/**
 * The _main_ react component that should be imported by _applications_ that use this _library_. Imported
 * `<Main>` component should be top level or wrapped in `<React.StrictMode>` and passed to
 * `ReactDOM.createRoot().render()`.
 *
 * This _main_ component is already wrapped inside the router.
 *
 * @param children
 * @param components
 */
const Main: React.FunctionComponent<{ children?: ReactNode, components: React.FC[] }> = ({ children, components = [] }) => {

  // https://18.react.dev/learn/passing-data-deeply-with-context
  // Context lets a parent—even a distant one!—provide some data to the entire tree inside of it.

  return (
      <AppProvider>
        <BrowserRouter basename={"/hawtio"}>
          <Routes>
            <Route index element={<HawtioPage children={children} components={components}/>}/>
            <Route path="login" element={<HawtioLogin/>}/>
            <Route path="about" element={<div>about</div>}/>
          </Routes>
        </BrowserRouter>
      </AppProvider>
  )
}

export { Main }
