import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import pinoLogger from 'express-pino-logger'
import createRouter from './routes'
import { createInMemoryDB } from './db'
import { createSessionStore } from './stores'

const port = process.env.PORT || 3001
const pino = pinoLogger()
const app = express()

app.use(cors())
app.use(pino)
app.use(bodyParser.json())

const sessionStore = createSessionStore({ db: createInMemoryDB('sessions') })
const apiRouter = createRouter({ sessionStore })

app.use('/api', apiRouter)

app.listen(port, () =>
  console.log(`Express server is running on localhost:${port}`)
)

export default app;
