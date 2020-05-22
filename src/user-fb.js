
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

const request = require('./utils/request.js')
const getProof = require('./utils/proof.js')

const FB_ENDPOINT = 'https://graph.facebook.com'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
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
  params.set('fields', 'name,locale')
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/${psid}?${params.toString()}`
  const response = await request('GET', url)
  const { body } = response

  if (body.error) {
    console.error('Error occured!')
    console.error(`Error: ${body.error.message}`)
    console.error(`Error Code: ${body.error.code}`)
    console.error(`URL: ${url}`)
  }

  return body
}

module.exports = { getProfile }
