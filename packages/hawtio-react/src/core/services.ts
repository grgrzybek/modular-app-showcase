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

/**
 * UserService class
 */
export class UserService {
  private readonly user: Promise<string>
  private userResolve: (user: string) => void = (_user: string) => {}
  private userReject: (error: string) => void = (_error: string) => {}

  constructor() {
    this.user = new Promise((resolve, reject) => {
      this.userResolve = resolve
      this.userReject = reject
    })
  }

  id() {
    return "userService"
  }

  async userName(): Promise<string> {
    return await this.user
  }

  async fetchUser(): Promise<void> {
    const res = await fetch("user")
    if (res.ok) {
      const user = await res.json()
      this.userResolve(user)
    } else {
      this.userReject(`Can't fetch user: "${res.statusText}"`)
    }
  }
}

/**
 * asd
 */
const userService = new UserService()

export { userService }
