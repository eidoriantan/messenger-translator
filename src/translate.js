
const { translate } = require('google-translate-api-browser')
const languages = require('./languages.js')

const DEBUG = process.env.DEBUG || false

/**
 *  Transforms HTML markups to its respective Messenger format
 *
 *    @param {string} text    The text to transform from
 *    @return {string} transformed
 */
function transformHTML (text) {
  const tags = {
    em: '_',
    b: '*'
  }

  const regexStr = `</?(${Object.keys(tags).join('|')})>`
  const regex = new RegExp(regexStr, 'g')
  return text.replace(regex, ($0, $1) => tags[$1])
}

/**
 *  Translates the text by contacting Google's Translate API.
 *
 *    @param {string} text    The text to be translated
 *    @param {string} iso    The language's ISO code, eg. en
 *    @param {string} detailed    Detailed mode
 *    @return {string} translated text
 */
async function translateText (text, iso, detailed) {
  if (DEBUG) console.log('Calling Google Translate to translate the text')
  const result = await translate(text, { to: iso })

  const language = languages[iso].name
  const from = languages[result.from.language.iso].name

  let translated = ''
  if (detailed) {
    translated += `Translated to: ${language}\r\n`
    translated += `Translated from: ${from}\r\n\r\n`
    translated += result.text
  } else translated += result.text

  if (result.from.text.didYouMean || result.from.text.autoCorrected) {
    result.from.text.value = transformHTML(result.from.text.value)
    translated += `\r\nDid you mean, "${result.from.text.value}"?`
  }

  return translated
}

module.exports = { translate: translateText }
