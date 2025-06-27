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

const AUTH_CONFIG_URL = "/auth/config"

export interface IAuthService {
  authMethods(): AuthenticationMethod[] | null
}

export enum AuthenticationKind {
  /**
   * Basic authentication - requires preparation of `Authorization: Basic <base64(user:password)>` HTTP header
   */
  basic,

  /**
   * Digest authentication - [Digest Access Authentication Scheme](https://www.rfc-editor.org/rfc/rfc2617#section-3),
   * uses several challenge parameters (realm, nonces, ...)
   */
  digest,

  /**
   * Form authentication - we need to know the URI to send the credentials to. It may be
   * `application/x-www-form-urlencoded` content (then we need to know the fields to use) or JSON with some schema.
   */
  form,

  /**
   * This may be tricky, because we can't control it at JavaScript level...
   */
  clientcert,

  /**
   * This is universal OpenID connect login type, so we need some information - should be configured
   * using `.well-known/openid-configuration` endpoint, but with additional parameters (to choose supported values
   * for some operations).
   */
  oidc,

  /**
   * Probably less standardized than `.well-known/openid-configuration`, but similar. We need to know the endpoints
   * to use for OAuth2 auth.
   */
  oauth2
}

export type AuthenticationMethod = {
  method: AuthenticationKind
}

export type BasicAuthenticationMethod = AuthenticationMethod & {
  /** Basic Authentication Realm - not sent with `Authorization`, but user should see it */
  realm: string
}

export type FormAuthenticationMethod = AuthenticationMethod & {
  /** POST URL to send the credentials to */
  url: string | URL

  /**
   * `application/x-www-form-urlencoded` or `application/json`. For JSON it's just object with two configurable fields
   */
  type: "form" | "json",

  /**
   * Field name for user name
   */
  userField: string

  /**
   * Field name for password (possibly encoded?)
   */
  passwordField: string
}

export type OidcAuthenticationMethod = AuthenticationMethod & {
  /**
   * Authentication provider URL - should be a _base_ address for the endpoints and for `/.well-known/openid-configuration`
   * discovery.
   */
  provider: string | URL

  /**
   * OpenID Connnect configuration obtained from [/.well-known/openid-configuration](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationRequest)
   * endpoint.
   *
   * If not available, We should hit the `/.well-known/openid-configuration` at {@link provider}.
   */
  "openid-configuration"?: Record<string, unknown>

  /**
   * Client ID to send to authorization endpoint
   */
  client_id: string

  /**
   * URL to redirect to after OIDC Authentication. Should be known (valid) at provider side
   */
  redirect_uri: string | URL

  /**
   * Scope parameter to choose - if not provided from the server side, should be determined at Hawtio side
   */
  scope?: string

  /**
   * Mode of response from `response_modes_supported` of OIDC metadata
   */
  response_mode: string

  /**
   * Code challenge type from `code_challenge_methods_supported	` of OIDC metadata
   */
  code_challenge_method?: "S256" | "plain"

  /**
   * (Type of prompt](https://openid.net/specs/openid-connect-prompt-create-1_0-07.html#section-4.2) to use.
   * Supported values are from `prompt_values_supported` OIDC metadata.
   */
  prompt?: string
}

class AuthService implements IAuthService {
  private methods: AuthenticationMethod[] | null = null

  constructor() {
    fetch(AUTH_CONFIG_URL)
        .then(r => {
          if (r.ok) {
            return r.json()
          } else {
            return []
          }
        })
        .then(j => {
          return this.methods = j as AuthenticationMethod[]
        })
        .catch(_reason => {
          // more serious fetch() problem than just HTTP 404 or 403 - usually connection refused or timeout
          return this.methods = []
        })
  }

  authMethods(): AuthenticationMethod[] | null {
    return this.methods
  }
}

export const authService = new AuthService()
