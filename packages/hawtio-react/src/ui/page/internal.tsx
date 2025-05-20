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

import React from 'react'
import { useUser } from '@src/auth/auth-provider'
import { useApp } from '@src/ui/context'

const C1: React.FC = () => {
  // calling useUser() custom hook is simply like calling all the hooks inside useUser()
  // so for example its effects will be run from all other components calling useUser()
  const { user } = useUser()

  return (
      <span>C1: {user}</span>
  )
}

const C2: React.FC = () => {
  const { user } = useUser()

  return (
      <span>C2: {user}</span>
  )
}

const C3: React.FC = () => {
  const { user: user } = useApp()

  return (
      <div style={{ "padding": "0.3em" }}>
        <button className="bt-test"
                onMouseEnter={() => { console.info("Mouse enter")}}
                onMouseLeave={() => { console.info("Mouse leave")}}
                onMouseDown={() => { console.info("Mouse down")}}
                onMouseUp={() => { console.info("Mouse up")}}
                onClick={() => { console.info("Mouse click")}}
        >C3 (button): {user}</button>
      </div>
  )
}

const C4: React.FC = () => {
  const { user: user } = useApp()

  return (
      <span>C4: {user}</span>
  )
}

export { C1, C2, C3, C4 }
