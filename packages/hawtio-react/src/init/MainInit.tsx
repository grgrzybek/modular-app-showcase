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

import { configurationService } from '@src/init/index'

const MainInit: React.FunctionComponent = () => {

  const [config, setConfig] = useState<Record<string, boolean>>(configurationService.getConfig())
  console.info("Config in <MainInit>:", config)

  useEffect(() => {
    const listener = (config: Record<string, boolean>) => {
      console.info("<MainInit> listener called with:", config)
      setTimeout(() => {
        console.info("Calling setConfig in setTimeout")
        setConfig(c => {
          return { ...config }
        })
      }, 1000)
    }
    configurationService.addListener(listener)
    return () => {
      configurationService.removeListener(listener)
    }
  }, [])

  const items: { item: string, ready: boolean }[] = []
  for (const item in config) {
    items.push({ item: item, ready: config[item] })
  }

  console.info("Returning component")
  return (
      <>
        <div>Loading...</div>
        {items.length > 0 ? (<ul>
          {
            items.map((el: { item: string, ready: boolean }, idx: number) => (
                <li key={idx}>{el.item}: {el.ready ? '+' : '-'}</li>))
          }
        </ul>) : null}
      </>
  )
}

export { MainInit }
