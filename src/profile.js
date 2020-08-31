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

const FuzzySet = require('fuzzyset.js')

const localeStrings = require('./locale/')
const hash = require('./utils/hash.js')
const replacer = require('./utils/replacer.js')
const request = require('./utils/request.js')

const database = require('./database.js')
const languages = require('./languages.js')

const ME_ENDPOINT = 'https://graph.facebook.com/v7.0/me'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET
const DEBUG = process.env.DEBUG

/**
 *  Changes the user's language
 *
 *  @param {string} user      User's object from the database
 *  @param {string} lang      Name of the language
 *
 *  @return {string} message
 */
async function changeLanguage (user, lang) {
  let name, code
  Object.keys(languages).forEach(key => {
    const language = languages[key]
    if (language.regex.exec(lang) !== null) {
      name = language.name
      code = key
    }
  })

  if (DEBUG) console.log(`Language requested: ${lang}`)
  if (!name || !code) {
    const langNames = Object.entries(languages).map(langObj => langObj[1].name)
    const fuzzy = FuzzySet(langNames).get(lang, null, 0.50)
    const template = localeStrings(user.locale, 'unknown_language')
    const replace = {
      TEXT: lang,
      MEAN: fuzzy !== null ? fuzzy.map(match => match[1]).join(',') : 'English'
    }

    return replacer(template, replace)
  }

  let menu = user.menu
  if (code !== menu[0]) {
    menu = [code, menu[0], '_help']
    await updateUserMenu(user.psid, menu)
  }

  await database.setUser(user.psid, { language: code, menu })
  const template = localeStrings(user.locale, 'language_change')
  const replace = { LANG: name }
  return replacer(template, replace)
}

/**
 *  Updates user's menu
 *
 *  @param {string} psid      User's page-scoped ID
 *  @param {string[]} menu    Array of menu item IDs
 *
 *  @return {object} response
 */
async function updateUserMenu (psid, menu) {
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
  const proof = hash('sha256', ACCESS_TOKEN, APP_SECRET)
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', proof)

  const url = `${ME_ENDPOINT}/custom_user_settings?${params.toString()}`
  const data = { psid, persistent_menu: persistentMenu }

  return await request('POST', url, {}, data)
}

/**
 *  Get user's Facebook profile.
 *
 *  @param {string} psid    User's page-scoped ID
 *  @return {object} profile
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
  let profile = response.body

  if (profile.error) {
    profile = {
      psid,
      name: '[NO NAME]',
      locale: 'en_US'
    }
  }

  return profile
}

module.exports = { changeLanguage, getProfile }
