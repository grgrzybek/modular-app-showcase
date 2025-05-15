import { describe, test, expect } from "@jest/globals"
import { userService } from "@showcase/hawtio-react"

describe("Core Services from hawtio-react tests", () => {

  test("User Service fetch test", async () => {
    await userService.fetchUser()
    const name = await userService.userName()
    expect(name).toEqual("grgr")
  })

})
