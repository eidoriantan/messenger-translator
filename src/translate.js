
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
  text = text.replace(regex, ($0, $1) => tags[$1])

  const regexEscaped = /&#([0-9]+);/g
  text = text.replace(regexEscaped, ($0, $1) => String.fromCharCode($1))

  return text
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
  const from = languages[result.from.language.iso]
    ? languages[result.from.language.iso].name : null

  let translated = ''
  if (detailed) {
    translated += `Translated to: ${language}\r\n`
    translated += from !== null ? `Translated from: ${from}\r\n\r\n` : ''
    translated += result.text
  } else translated += result.text

  if (result.from.text.didYouMean || result.from.text.autoCorrected) {
    result.from.text.value = transformHTML(result.from.text.value)
    translated += `\r\nDid you mean, "${result.from.text.value}"?`
  }

  return translated
}

module.exports = { translate: translateText }
