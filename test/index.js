
/**
 *  Copyright 2020 Adriane Justine Tan
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
