
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

const request = require('../src/utils/request.js')
const getProof = require('../src/utils/proof.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

/**
 *  Setting the "Persistent Menu" property
 */
async function setMenu () {
  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/messenger_profile?${params.toString()}`
  const data = {
    persistent_menu: [{
      locale: 'default',
      composer_input_disabled: false,
      call_to_actions: [{
        type: 'postback',
        title: '--language English',
        payload: 'change_language'
      }, {
        type: 'postback',
        title: '--language Japanese',
        payload: 'change_language'
      }, {
        type: 'postback',
        title: 'Get Help',
        payload: 'get_help'
      }]
    }]
  }

  console.log('Setting `Persistent Menu`')
  console.log(data)
  const response = await request('POST', url, {}, data)
  console.log(`Result: ${response}`)
}

setMenu().then(() => {
  console.log('Operation completed')
})
