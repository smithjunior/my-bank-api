import express from 'express'
import { promises } from 'fs'

const router = express.Router()

const { readFile, writeFile } = promises

router.get('/', async (_, response) => {
  try {
    const data = await readFile(global.fileName, 'utf8')
    const accountsJson = JSON.parse(data)

    delete accountsJson.nextId

    logger.info('GET /account')

    response.json(accountsJson)
  } catch (err) {
    logger.error(`GET /account - ${JSON.stringify(err.message)}`)
    response.status(400).json({ error: err.message })
  }
})

router.get('/:id', async (request, response) => {
  const accountId = parseInt(request.params.id)

  try {
    const data = await readFile(global.fileName, 'utf8')
    const accountsJson = JSON.parse(data)
    const account = accountsJson.accounts.find(account => account.id === accountId)

    if (!account) {
      response.status(400).json({ error: 'Not founded the account!' })
    }

    logger.info(`GET /account/${accountId} - ${JSON.stringify(account)}`)

    response.json(account)
  } catch (err) {
    logger.error(`GET /account/${accountId} - ${JSON.stringify(err.message)}`)
    response.status(400).json({ error: err.message })
  }
})
router.post('/', async (request, response) => {
  try {
    let account = request.body
    const data = await readFile(global.fileName, 'utf8')
    const json = JSON.parse(data)
    const newId = json.nextId

    account = { id: newId, ...account }

    json.accounts.push(account)
    json.nextId = newId + 1

    await writeFile(global.fileName, JSON.stringify(json))

    logger.info(`POST /account - ${JSON.stringify(account)}`)

    response.json(account)
  } catch (err) {
    logger.error(`POST /account - ${JSON.stringify(err.message)}`)
    response.status(400).send({ erro: err.message })
  }
})

router.delete('/:id', async (request, response) => {
  const accountId = parseInt(request.params.id)

  try {
    const data = await readFile(global.fileName, 'utf8')
    const accountsJson = JSON.parse(data)
    const accountsUpdated = accountsJson.accounts.filter(account => account.id !== accountId)

    if (!accountsUpdated) {
      response.status(400).json({ error: 'Not founded the account!' })
    }

    accountsJson.accounts = accountsUpdated

    await writeFile(global.fileName, JSON.stringify(accountsJson))

    logger.info(`DELETE /account/${accountId}`)

    response.json({ deleted: true })
  } catch (err) {
    logger.error(`DELETE /account/${accountId} - ${JSON.stringify(err.message)}`)
    response.status(400).json({ error: err.message })
  }
})

router.put('/:id', async (request, response) => {
  const accountId = parseInt(request.params.id)
  try {
    const newAccount = request.body

    const data = await readFile(global.fileName, 'utf8')
    const accountsJson = JSON.parse(data)
    const oldIndex = accountsJson.accounts.findIndex(account => account.id === newAccount.id)

    accountsJson.accounts[oldIndex] = newAccount

    await writeFile(global.fileName, JSON.stringify(accountsJson))

    logger.info(`PUT /account/${accountId} - ${JSON.stringify(newAccount)}`)

    response.json(newAccount)
  } catch (err) {
    logger.error(`PUT /account/${accountId} - ${JSON.stringify(err.message)}`)
    response.status(400).json({ error: err.message })
  }
})

router.post('/deposit', async (request, response) => {
  try {
    const params = request.body
    const data = await readFile(global.fileName, 'utf8')
    const accountsJson = JSON.parse(data)
    const index = accountsJson.accounts.findIndex(account => account.id === params.id)

    accountsJson.accounts[index].balance += params.value

    await writeFile(global.fileName, JSON.stringify(accountsJson))

    logger.info(`POST /account/deposit - ${JSON.stringify(params)}`)

    response.json(accountsJson.accounts[index])
  } catch (err) {
    logger.error(`POST /account/deposit - ${JSON.stringify(err.message)}`)
    response.status(400).json({ error: err.message })
  }
})

export default router
