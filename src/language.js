
const languages = require('./languages.js')

/**
 *  Parses language payloads. `LANG_EN` --> { iso: 'en', name: 'English' }
 *
 *    @param {string} language    Language payload
 *    @return {object} parsed language
 */
function parseLang (language) {
  const iso = language.split('_')[1].toLowerCase()
  const name = languages[iso]

  return { iso, name }
}

module.exports = { parseLang }
