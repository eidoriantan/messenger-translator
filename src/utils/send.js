
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

const request = require('./request.js')
const getProof = require('./proof.js')

const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const DEBUG = process.env.DEBUG

/**
 *  Sends a message to user by calling Messenger's Send API.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string} text    The message to send
 *    @param {string} type    Send message type
 *    @return void
 */
module.exports = async function (psid, text, type = 'message') {
  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())

  const url = `${FB_ENDPOINT}/messages?${params.toString()}`
  const data = {
    messaging_type: 'RESPONSE',
    notification_type: 'SILENT_PUSH',
    recipient: { id: psid }
  }

  if (type === 'message') data.message = { text }
  else data.sender_action = type

  if (DEBUG) console.log(`Sending user "${psid}" (${type}): ${text}`)
  const response = await request('POST', url, {}, data)
  const { body } = response

  if (body.error) {
    console.error('Error occured!')
    console.error(`Error: ${body.error.message}`)
    console.error(`Error Code: ${body.error.code}`)
    console.error(`URL: ${url}`)
    console.error(`Data: ${JSON.stringify(data)}`)
  }
}
