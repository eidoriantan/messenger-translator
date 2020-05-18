
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
const userDB = require('./user-database.js')
const { setUserMenu } = require('./menu.js')

const DEBUG = process.env.DEBUG

/**
 *  Changes the language of the user from the database if supported
 *
 *    @param {string} user    User's object from the database
 *    @param {string} lang    Name of the language
 *    @return {string} message
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
  if (!name || !code) return `Unknown language: ${lang}`

  let menu = user.menu
  if (code !== menu[0]) {
    menu = [code, menu[0], '_help']
    await setUserMenu(user.psid, menu)
  }

  await userDB.setUser(user.psid, { language: code, menu })
  return `Language was changed to ${name}!`
}

module.exports = { changeLanguage }
