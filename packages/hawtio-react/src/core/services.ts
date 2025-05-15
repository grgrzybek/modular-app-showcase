
class UserService {
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

const userService = new UserService()

export { userService }
