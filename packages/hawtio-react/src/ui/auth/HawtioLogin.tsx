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
import { useNavigate } from 'react-router'

import { useApp } from '@src/ui/context'
import {
  BackgroundImage, Brand,
  Login,
  LoginFooter,
  LoginForm,
  LoginHeader,
  LoginMainBody, LoginMainFooter,
  LoginMainHeader
} from '@patternfly/react-core'

import "./HawtioLogin.css"
import { WarningTriangleIcon } from '@patternfly/react-icons'

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

  const { user, login } = useApp()
  const navigate = useNavigate()
  // const inRouter = useInRouterContext()

  const [ username, setUsername ] = useState("")
  const [ validUsername, setValidUsername ] = useState(true)
  const [ password, setPassword ] = useState("")
  const [ validPassword, setValidPassword ] = useState(true)

  const [ helperText, setHelperText ] = useState("")
  const [ showHelperText, setShowHelperText ] = useState(false)

  // to "use" a context, some parent component has to "provide" it

  // we can't have a hook within condition: Uncaught Error: Rendered more hooks than during the previous render
  useEffect(() => {
    if (user) {
      // think of effect function as "synchronization with external system used by this component"
      let navigation: NodeJS.Timeout
      navigation = setTimeout(() => navigate("/"), 2000)
      return () => {
        // think of effect cleanup function as "unsynchronization from external system used by this component"
        if (navigation) {
          clearTimeout(navigation)
        }
      }
    }
  }, [user])
  if (user) {
    return (<>
      <div>Already logged in as {user}. Redirecting in 2s...</div>
    </>)
  }

  // const methods = use(authService.authMethods())

  const HeaderBrand = <Brand src="static/images/hawtio-brand.png" alt="Hawtio" />
  const Header = <LoginHeader headerBrand={HeaderBrand} />

  const Footer = <LoginFooter>Welcome to Hawtio</LoginFooter>

  const doLogin = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    ev.preventDefault()
    setValidUsername(true)
    setValidPassword(true)
    setShowHelperText(false)
    setHelperText("")

    let valid = true
    if (!username) {
      setValidUsername(false)
      setShowHelperText(true)
      valid = false
    }
    if (!password) {
      setValidPassword(false)
      setShowHelperText(true)
      valid = false
    }
    if (valid) {
      console.info("Login as", username, "with password", password)
      fetch("login", { method: "POST", body: JSON.stringify({ username, password }), headers: { "Content-Type": "application/json" } })
          .then(r => {
            if (r.ok) {
              // HTTP == 200
              login(username)
              navigate("/")
            } else {
              // HTTP != 200
              setShowHelperText(true)
              setHelperText("Error when processing login: HTTP " + r.status)
            }
          })
          .catch(e => {
            setShowHelperText(true)
            setHelperText("Error when processing login: " + e)
          })
    } else {
      setHelperText("Please specify username and password")
    }
  }

  // see @patternfly/react-core/src/components/LoginPage/LoginPage.tsx
  // I want to specify a class name for the background image.
  // "pf-v5-c-background-image" class' rules will take over anyway with the <style> ordering used (random) by
  // style-loader, so we can't avoid using "!important" anyway... At least at my stage of experience
  return (
      <>
        <BackgroundImage src="static/images/hawtio-wallpaper.png" className="hwt-login-page" />
        <Login header={Header} footer={Footer}>
          <LoginMainHeader title="Log in to your account" subtitle="Subtitle ...">
          </LoginMainHeader>
          <LoginMainBody>
            <LoginForm
                usernameValue={username}
                passwordValue={password}
                onChangeUsername={(_, v) => setUsername(v)}
                onChangePassword={(_, v) => setPassword(v)}
                isValidUsername={validUsername}
                isValidPassword={validPassword}
                helperText={helperText}
                helperTextIcon={<WarningTriangleIcon />}
                showHelperText={showHelperText}
                onLoginButtonClick={doLogin}
            />
          </LoginMainBody>
          <LoginMainFooter>
          </LoginMainFooter>
        </Login>
      </>
  )
}

export { HawtioLogin }
