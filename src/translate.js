
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

const { translate } = require('google-translate-api-browser')
const Kuroshiro = require('kuroshiro')
const Kuromoji = require('kuroshiro-analyzer-kuromoji')
const hangulRomanization = require('hangul-romanization')
const pinyin = require('chinese-to-pinyin')
const languages = require('./languages.js')

const kuroshiro = new Kuroshiro()
const analyzer = new Kuromoji()
const kuroinit = kuroshiro.init(analyzer)

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
  let romaji = ''

  if (iso === 'ja') {
    await kuroinit
    romaji = await kuroshiro.convert(result.text, {
      to: 'romaji',
      mode: 'spaced'
    })
  } else if (iso === 'ko') {
    romaji = hangulRomanization.convert(result.text)
  } else if (iso === 'zh-cn' || iso === 'zh-tw') {
    romaji = pinyin(result.text, { keepRest: true, removeTone: true })
  }

  if (romaji !== '') result.text += `\r\n*romaji*: ${romaji}`

  const language = languages[iso].name
  const from = languages[result.from.language.iso]
    ? languages[result.from.language.iso].name : null

  let translated = ''
  if (detailed) {
    translated += `Translated to: ${language}\r\n`
    translated += from !== null ? `Translated from: ${from}\r\n` : ''
    translated += '\r\n' + result.text
  } else translated += result.text

  if (result.from.text.didYouMean || result.from.text.autoCorrected) {
    result.from.text.value = transformHTML(result.from.text.value)
    translated += `\r\nDid you mean, "${result.from.text.value}"?`
  }

  return translated.trim()
}

module.exports = { translate: translateText }
