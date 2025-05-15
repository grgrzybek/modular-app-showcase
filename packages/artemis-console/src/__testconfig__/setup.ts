import { afterAll, beforeAll } from "@jest/globals"

import http from 'node:http'
import express from "express"
import type { Request as ERequest, Response as EResponse } from "express-serve-static-core"

import { port } from "../../jest.config"

let server: http.Server

beforeAll(async () => {
  server = http.createServer({}, app).listen(port)
})

afterAll(() => {
  server.closeAllConnections()
  server.close()
})

const jolokiaRouter = express.Router()

jolokiaRouter.all(/.*/, (_req, res, next) => {
  res.set("Content-Type", "application/json")
  next()
})

let versionHandler = (_req: ERequest, res: EResponse) => {
  res.status(200).json({
    status: 200,
    timestamp: Date.now(),
    request: { type: "version" },
    value: {
      agent: "2.1.0",
      protocol: "8.0"
    }
  })
}
jolokiaRouter.get("", versionHandler)
jolokiaRouter.get("/version", versionHandler)

const hawtioRouter = express.Router()

hawtioRouter.get("/keycloak/enabled", (_req, res) => {
  res.status(200).send("false")
})
hawtioRouter.get("/auth/config", (_req, res) => {
  res.status(200).json({})
})
hawtioRouter.get("/hawtconfig.json", (_req, res) => {
  res.status(200).json({})
})
hawtioRouter.get("/user", (_req, res) => {
  res.status(200).send("\"grgr\"")
})

const app = express()
app.use(express.json({ type: "*/json" }))

app.use("/jolokia", jolokiaRouter)
app.use("/hawtio", hawtioRouter)
