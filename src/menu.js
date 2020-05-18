
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

const languages = require('./languages.js')
const request = require('./utils/request.js')
const getProof = require('./utils/proof.js')

const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const DEBUG = process.env.DEBUG

/**
 *  Updates user's menu according to its currently used language
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string[]} menu    Array of menu item IDs
 *    @return {object} response
 */
async function setUserMenu (psid, menu) {
  const persistentMenu = [{
    locale: 'default',
    composer_input_disabled: false,
    call_to_actions: []
  }]

  menu.forEach(menuitem => {
    const language = menuitem !== '_help' ? languages[menuitem].name : ''
    persistentMenu[0].call_to_actions.push({
      type: 'postback',
      title: menuitem === '_help' ? 'Get Help' : `--language ${language}`,
      payload: menuitem === '_help' ? 'get_help' : 'change_language'
    })
  })

  if (DEBUG) {
    console.log('Setting new persistent menu for user')
    console.log(persistentMenu)
  }

  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/custom_user_settings?${params.toString()}`
  const data = { psid, persistent_menu: persistentMenu }

  return await request('POST', url, {}, data)
}

module.exports = { setUserMenu }
