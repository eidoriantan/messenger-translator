
const languages = require('./languages.js')
const { setUserMenu } = require('./menu.js')

const DEBUG = process.env.DEBUG

/**
 *  Changes the language of the user from the database if supported
 *
 *    @param {string} user    User's object from the database
 *    @param {string} lang    Name of the language
 *    @param {SQLPool} database    Connection to the database
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

  return { name, code, menu }
}

module.exports = { changeLanguage }
