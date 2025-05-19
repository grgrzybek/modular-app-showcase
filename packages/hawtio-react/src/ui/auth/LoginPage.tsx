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

import React, { useEffect, useState } from "react"

import { useInRouterContext, useNavigate } from 'react-router'

const LoginPage: React.FunctionComponent = () => {

  const [ user, ] = useState("grgr")
  const navigate = useNavigate()
  const inRouter = useInRouterContext()

  console.info("In router context:", inRouter)

  if (user) {
    console.info("User", user, "already logged in")
    useEffect(() => {
      navigate("/")
    }, []);
  }

  return (
      <>
        <div>Login page ...</div>
      </>
  )
}

export { LoginPage }
