import { describe, test, expect } from "@jest/globals"
import { userService } from "./services"

describe("Core Services tests", () => {

  test("User Service test", () => {
    expect(userService.id()).toBe("userService")
  })

})
