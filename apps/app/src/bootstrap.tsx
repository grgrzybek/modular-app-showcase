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

import React from "react"
import ReactDOM from "react-dom/client"

import { Main } from "@showcase/hawtio-react"
import { Component1 } from "./ui/Component1"
import { NavLink } from 'react-router'

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement)
root.render(
    <React.StrictMode>
      {/* We can pass a React component function as function itself - to be "instantiated" by React when needed */}
      <Main components={[Component1]}>
        <span>Hello!</span>
        <span id="c1">Hello!</span>
        {/* NavLink component requires parent BrowserRouter and it was failing without webpacks resolve.alias config (ChatGPT helped) */}
        <NavLink to="/login">Login page (as child)</NavLink>
      </Main>
    </React.StrictMode>
)
