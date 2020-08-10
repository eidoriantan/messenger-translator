
/**
 *  Messenger Translator
 *  Copyright (C) 2020 Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
    require('./translate.js')
    server.close()
  })
})
