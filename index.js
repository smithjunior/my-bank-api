import express from 'express'
import { promises } from 'fs'
import winston from 'winston'
import accountRouter from './routes/accounts.js'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './doc.js'
import cors from 'cors'

const app = express()

const { combine, timestamp, label, printf } = winston.format

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

global.fileName = 'accounts.json'

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'my-bank-api.log' })
  ],
  format: combine(
    label({ label: 'my-bank-api' }),
    timestamp(),
    myFormat
  )
})

app.use(express.json())

app.use(cors())

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/account', accountRouter)

app.get('/', (request, response) => {
  return response.send('Running ...')
})

app.listen(3000, async () => {
  try {
    await promises.readFile(global.fileName, 'utf8')
    logger.info('Api Started!')
  } catch (err) {
    const initialJson = {
      nextId: 0,
      accounts: []
    }

    promises.writeFile(global.fileName, JSON.stringify(initialJson))
      .catch(err => {
        logger.error(err)
      })
  }
})
