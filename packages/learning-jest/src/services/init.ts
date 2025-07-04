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

import { connectService } from "./connect-service"

let proxyEnabled: boolean | null = null

export async function isActive(): Promise<boolean> {
  const enabled = await isProxyEnabled()
  if (!enabled) {
    return false
  }

  return connectService.getCurrentConnectionId() == null
}

async function isProxyEnabled(): Promise<boolean> {
  if (proxyEnabled != null) {
    return proxyEnabled
  }

  try {
    const res = await fetch("proxy/enabled")
    if (!res.ok) {
      return false
    }

    const data = await res.text()
    proxyEnabled = data.trim() === "true"
  } catch (err) {
    proxyEnabled = false
  }

  return proxyEnabled
}
