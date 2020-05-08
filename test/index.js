
const supertest = require('supertest')
const should = require('should')

const { app, server } = require('../server.js')
const request = supertest(app)

const VALIDATION_TOKEN = process.env.VALIDATION_TOKEN
process.env.DEBUG = true

describe('Bot test', () => {
  it('Verify webhook', done => {
    const query = `hub.mode=subscribe&hub.verify_token=${VALIDATION_TOKEN}`
    const challenge = 'kwAvays'

    request.get(`/webhook?${query}&hub.challenge=${challenge}`)
      .expect(200)
      .expect(response => should.strictEqual(response.text, challenge))
      .end(error => {
        if (error) throw error
        done()
      })
  })

  after(() => {
    require('./database.js')
    server.close()
  })
})
