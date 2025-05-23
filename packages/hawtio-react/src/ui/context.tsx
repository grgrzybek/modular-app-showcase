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

import React, { createContext, ReactNode, useContext, useState } from 'react'

// https://lovetrivedi.medium.com/unlocking-the-full-potential-of-react-context-with-custom-hooks-f3d7e3a3d403

export type AppState = {
  initialization: boolean
  user: string | null
  login: (user: string) => void
  logout: () => void
}

const AppContext = createContext<AppState>({
  initialization: true,
  user: null,
  login: () => {},
  logout: () => {},
})

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {

  const [ initialization, setInitialization ] = useState(true)
  const [ user, setUser ] = useState<string | null>(null)

  const login = (user: string) => {
    setInitialization(false)
    setUser(user)
  }

  const logout = () => {
    setInitialization(false)
    fetch("logout", { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } })
        .then(r => {
          if (r.ok) {
            // HTTP == 200
            setUser(null)
          }
        })
        .catch(_e => {})
  }

  return (
      <AppContext.Provider value={{ initialization, user, login, logout }}>
        {children}
      </AppContext.Provider>
  )

}

export function useApp(): AppState {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("AppState from AppContext is not provided (did you wrap the component in <AppProvider>?)")
  }

  return context
}
