
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

const logger = require('./log.js')
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
    logger.write(`Error when trying to send message: ${psid}`)
    logger.write(`Error(${body.error.code}): ${body.error.message}`)
    logger.write('Data:')
    logger.write(data)
  }
}
