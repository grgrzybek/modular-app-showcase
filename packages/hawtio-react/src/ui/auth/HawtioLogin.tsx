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

import React, { useContext, useEffect, useState } from "react"
import { useInRouterContext, useNavigate } from 'react-router'

import { authService } from "@src/auth/auth-service"
import { useApp } from '@src/ui/context'

/**
 * This is not a login page - it's a component that checks authentication status and lets user choose login method.
 *
 * It decides based on:
 * * status of logged-in user
 * * the authentication method available for given Jolokia connection
 *
 * @constructor
 */
const HawtioLogin: React.FunctionComponent = () => {

  const { user } = useApp()
  const navigate = useNavigate()
  const inRouter = useInRouterContext()

  console.info("In router context:", inRouter)

  // to "use" a context, some parent component has to "provide" it

  let navigation: NodeJS.Timeout
  if (user) {
    useEffect(() => {
      // think of effect function as "synchronization with external system used by this component"
      navigation = setTimeout(() => navigate("/"), 2000);
      return () => {
        // think of effect cleanup function as "unsynchronization from external system used by this component"
        if (navigation) {
          clearTimeout(navigation)
        }
      }
    }, []);

    return (<>
      <div>Already logged in as {user}. Redirecting in 2s...</div>
    </>)
  }

  // const methods = use(authService.authMethods())

  return (
      <>
        <div>Login page</div>
      </>
  )
}

export { HawtioLogin }
