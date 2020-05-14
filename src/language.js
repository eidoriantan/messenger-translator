
const languages = require('./languages.js')
const userDB = require('./user-database.js')
const { setUserMenu } = require('./menu.js')

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

  if (!name || !code) return `Unknown language: ${lang}`

  let menu
  if (code !== user.menu[0]) {
    menu = [code, user.menu[0], '_help']
    if (user.stats[code]) user.stats[code].count++
    else user.stats[code] = { count: 1 }
  }

  await userDB.setUser(user.psid, { language: code, menu, stats: user.stats })
  await setUserMenu(user.psid, menu)

  return `Language was changed to ${name}!`
}

module.exports = { changeLanguage }
