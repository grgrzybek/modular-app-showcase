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

import { MainPage } from "./page/HawtioPage"

import "./Main.css"
import { LoginPage } from './auth/LoginPage'

/**
 * The _main_ react component that should be imported by _applications_ that use this _library_. Imported
 * `<Main>` component should be top level or wrapped in `<React.StrictMode>` and passed to
 * `ReactDOM.createRoot().render()`.
 *
 * This _main_ component is already wrapped inside the router.
 *
 * @param children
 * @param components
 * @constructor
 */

const Main: React.FunctionComponent<{ children?: ReactNode, components: React.FC[] }> = ({ children, components = [] }) => {

  return (
      <BrowserRouter>
        <Routes>
          <Route index element={<MainPage children={children} components={components}/>}/>
          <Route path="login" element={<LoginPage/>}/>
          <Route path="about" element={<div>about</div>}/>
        </Routes>
      </BrowserRouter>
  )
}

export { Main }
