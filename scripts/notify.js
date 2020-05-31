
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

const sql = require('mssql')
const request = require('../src/utils/request.js')
const getProof = require('../src/utils/proof.js')

const SERVER = process.env.SERVER
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

const config = {
  server: SERVER,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  options: {
    enableArithAbort: true,
    encrypt: true
  }
}

async function send () {
  const pool = await sql.connect(config)
  const result = await pool.request().query('SELECT * FROM users')
  const users = result.recordset
  const message = process.argv[1]
  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())

  const url = `${FB_ENDPOINT}/messages?${params.toString()}`
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const data = {
      messaging_type: 'UPDATE',
      recipient: { id: user.psid },
      message: { text: message }
    }

    console.log(`Sending the message to "${user.name}"`)
    const response = await request('POST', url, {}, data)
    console.log(`Result: ${response.body}`)
  }

  pool.close()
}

send().then(() => {
  console.log('Operation completed')
})
