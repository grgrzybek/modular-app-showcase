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

import fetchMock from "jest-fetch-mock"
import { beforeEach, describe, expect, jest, test } from "@jest/globals"

describe("isActive tests", () => {

  beforeEach(() => {
    // this works only with require() and import(). doesn't work with static import
    jest.resetModules()
    fetchMock.resetMocks()
  })

  test('/proxy/enabled returns false', async () => {
    fetchMock.mockResponse('   false   \n')
    const { isActive } = await import("./init")
    await expect(isActive()).resolves.toEqual(false)
  })

  test('/proxy/enabled returns nothing', async () => {
    fetchMock.mockResponse('')
    const { isActive } = await import("./init")
    await expect(isActive()).resolves.toEqual(false)
  })

  test('/proxy/enabled returns true & connection name is not set', async () => {
    fetchMock.mockResponse('true')
    const { isActive } = await import("./init")
    const { connectService } = await import("./connect-service")
    connectService.getCurrentConnectionId = jest.fn(() => null)

    await expect(isActive()).resolves.toEqual(true)
  })

  test('/proxy/enabled returns true & connection name is set', async () => {
    fetchMock.mockResponse('true')
    const { isActive } = await import("./init")
    const { connectService } = await import("./connect-service")
    connectService.getCurrentConnectionId = jest.fn(() => 'test-connection')

    await expect(isActive()).resolves.toEqual(false)
  })

})
