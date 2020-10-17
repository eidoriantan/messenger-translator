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

const hash = require('../src/utils/hash.js')
const request = require('../src/utils/request.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET

describe('Facebook', () => {
  it('Debug ACCESS_TOKEN', async () => {
    const endpoint = 'https://graph.facebook.com/v8.0/debug_token'
    const params = new URLSearchParams()
    const proof = hash('sha256', ACCESS_TOKEN, APP_SECRET)
    params.set('input_token', ACCESS_TOKEN)
    params.set('access_token', ACCESS_TOKEN)
    params.set('appsecret_proof', proof)

    const debug = `${endpoint}?${params.toString()}`
    const response = await request('GET', debug)

    if (response.status !== 200) throw new Error(response.message)
  })
})

require('./database.js')
require('./translate.js')
