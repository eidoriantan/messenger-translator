
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
