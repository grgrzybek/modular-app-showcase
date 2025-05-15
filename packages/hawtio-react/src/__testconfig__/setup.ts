import { afterAll, beforeAll } from "@jest/globals"

import http from 'node:http'
import express from "express"

import { port } from "../../jest.config"

let server: http.Server

beforeAll(async () => {
  server = http.createServer({}, app).listen(port)
})

afterAll(() => {
  server.closeAllConnections()
  server.close()
})

const hawtioRouter = express.Router()

hawtioRouter.get("/user", (_req, res) => {
  res.status(200).send("\"grgr\"")
})

const app = express()
app.use(express.json({ type: "*/json" }))

app.use("/hawtio", hawtioRouter)
