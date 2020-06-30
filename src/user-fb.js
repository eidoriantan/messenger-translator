
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

const hash = require('./utils/hash.js')
const logger = require('./utils/log.js')
const request = require('./utils/request.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET
const DEBUG = process.env.DEBUG

/**
 *  Get user's Facebook profile.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return {object} profile
 */
async function getProfile (psid) {
  if (DEBUG) console.log(`Getting profile with User ID: ${psid}`)

  const params = new URLSearchParams()
  const proof = hash('sha256', ACCESS_TOKEN, APP_SECRET)
  params.set('fields', 'name,locale')
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', proof)

  const url = `https://graph.facebook.com/${psid}?${params.toString()}`
  const response = await request('GET', url)
  const body = response.body

  if (body.error) {
    logger.write(`Unable to get user's FB profile: ${psid}`)
    logger.write(`Error(${body.error.code}): ${body.error.message}`)
  }

  return body
}

module.exports = { getProfile }
