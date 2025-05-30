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

class ConfigurationService {
  private config: Record<string, boolean> = {}
  private listeners: ((c: Record<string, boolean>) => void)[] = []

  constructor() {
    const h = setInterval(() => {
      for (const k of Object.keys(this.config)) {
        this.config[k] = true
      }
      if (Object.keys(this.config).length > 5) {
        clearInterval(h)
      } else {
        const name = "ASD " + Math.round(Math.random() * 100)
        this.config[name] = false
      }
      this.newConfig(this.config)
    }, 100)
  }

  addListener(f: (c: Record<string, boolean>) => void) {
    this.listeners.push(f)
  }

  removeListener(f: (c: Record<string, boolean>) => void) {
    this.listeners.splice(this.listeners.indexOf(f), 1)
  }

  private newConfig(config: Record<string, boolean>) {
    this.config = config
    for (const l of this.listeners) {
      l(this.config)
    }
  }

  private changeConfig(item: string, ready: boolean) {
    this.config[item] = ready
    for (const l of this.listeners) {
      l(this.config)
    }
  }

  getConfig(): Record<string, boolean> {
    return this.config
  }
}

export const configurationService = new ConfigurationService()
export * from "./MainInit"
export * from "@src/core"
