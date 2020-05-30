
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
