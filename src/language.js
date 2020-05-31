
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
  if (!name || !code) {
    const langNames = Object.entries(languages).map(langObj => langObj[1].name)
    const fuzzy = FuzzySet(langNames).get(lang, null, 0.50)
    let result = `Unknown language: ${lang}`

    if (fuzzy !== null) {
      result = 'Did you mean: ' + fuzzy.map(match => match[1]).join(', ')
    }

    return result
  }

  let menu = user.menu
  if (code !== menu[0]) {
    menu = [code, menu[0], '_help']
    await setUserMenu(user.psid, menu)
  }

  await userDB.setUser(user.psid, { language: code, menu })
  return `Language was changed to ${name}!`
}

module.exports = { changeLanguage }
