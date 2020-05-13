
const languages = require('./languages.js')
const userDB = require('./user-database.js')

/**
 *  Changes the language of the user from the database if supported
 *
 *    @param {string} psid    User-scoped page ID
 *    @param {string} lang    Name of the language
 *    @return {string} message
 */
async function changeLanguage (psid, lang) {
  let name, code

  Object.keys(languages).forEach(key => {
    const language = languages[key]
    if (language.regex.exec(lang) !== null) {
      name = language.name
      code = key
    }
  })

  if (code) {
    await userDB.setUser(psid, { language: code })
    return `Language was changed to ${name}!`
  } else return `Unknown language: ${lang}`
}

module.exports = { changeLanguage }
