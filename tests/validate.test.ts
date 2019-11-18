import { safeDump } from 'js-yaml'
import express from 'express'
import request from 'request-promise-native'

import { validator } from '../src/validate'
import { Server } from 'net'

describe('validate', () => {
  let server: Server
  let port = 3003
  let uri = `http://localhost:${port}/validate`

  beforeAll(done => {
    const app = express()
    app.use('/validate', validator)
    server = app.listen(port, done)
  })

  afterAll(done => {
    server.close(done)
  })

  test('shows correct usage description', async () => {
    const res = await request({
      uri,
      method: 'GET',
      json: true,
    }).promise()

    expect(res).toMatchSnapshot()
  })

  test('correctly reports invalid configuration', async () => {
    const config = safeDump({
      opencollective: 'https://opencollective.com/graphql-shield',
    })

    await request({
      uri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: config,
    })
      .promise()
      .then(() => {
        fail()
      })
      .catch(err => {
        expect(err).toMatchSnapshot()
      })
  })

  test('correctly handles invalid input', async () => {
    const config = `f123
      opencollective: 'https://opencollective.com/graphql-shield',
    `

    await request({
      uri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: config,
    })
      .promise()
      .then(() => {
        fail()
      })
      .catch(err => {
        expect(err).toMatchSnapshot()
      })
  })

  test('correctly validates valid configuration', async () => {
    const config = safeDump({
      collective: 'graphql-shield',
    })

    const res = await request({
      uri,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: config,
    })

    expect(res).toMatchSnapshot()
  })
})
