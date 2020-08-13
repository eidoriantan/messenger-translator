
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

const translate = require('@vitalets/google-translate-api')
const Kuroshiro = require('kuroshiro')
const Kuromoji = require('kuroshiro-analyzer-kuromoji')
const hangulRomanization = require('hangul-romanization')
const pinyin = require('chinese-to-pinyin')
const https = require('https')

const localeStrings = require('./locale/')
const logger = require('./utils/log.js')
const replacer = require('./utils/replacer.js')
const languages = require('./languages.js')

const kuroshiro = new Kuroshiro()
const analyzer = new Kuromoji()
const kuroinit = kuroshiro.init(analyzer)

const DEBUG = process.env.DEBUG || false
const PROXIES = process.env.PROXIES

/**
 *  Translates the text.
 *
 *    @param {string} text      The text to be translated
 *    @param {string} iso       The language's ISO code, eg. en
 *    @param {string} locale    User's locale for response messages
 *
 *    @return {string} translated text
 */
module.exports = async function (text, iso, locale) {
  let proxies = PROXIES.split(',')
  let result = null
  let romaji

  if (DEBUG) console.log('Calling Google Translate to translate the text')
  while (result === null) {
    if (proxies.length === 0) break

    const random = Math.floor(Math.random() * proxies.length)
    const proxy = proxies[random]
    proxies = proxies.filter(element => proxy !== element)

    if (DEBUG) console.log(`Trying proxy server: ${proxy}`)
    try {
      result = await translate(text, { to: iso, client: 'gtx' }, {
        request: function (options, callback) {
          /**
           *  Wrapper for proxying using `cors-anywhere`
           *  @see https://github.com/Rob--W/cors-anywhere
           */
          const url = `https://${proxy}/${options.href}`
          const opt = {
            headers: { 'x-requested-with': `Node.js ${process.version}` },
            timeout: 20000
          }

          return https.request(url, opt, callback)
        }
      })
    } catch (e) {}
  }

  if (result === null) {
    if (DEBUG) console.log('Unable to translate the text')
    logger.write('Unable to translate text! Please check proxy servers', 1)

    const message = localeStrings(locale, 'requests_limit')
    return message
  }

  switch (iso) {
    case 'ja':
      await kuroinit
      romaji = await kuroshiro.convert(result.text, {
        to: 'romaji',
        mode: 'spaced'
      })
      break

    case 'ko':
      romaji = hangulRomanization.convert(result.text)
      break

    case 'zh-CN':
    case 'zh-TW':
      romaji = pinyin(result.text, { keepRest: true, removeTone: true })
      break

    default:
      romaji = null
  }

  if (romaji) result.text += `\r\n*romaji*: ${romaji}`

  const language = languages[iso].name
  const from = languages[result.from.language.iso]
    ? languages[result.from.language.iso].name : 'Unknown'

  const template = localeStrings(locale, 'body')
  const replace = {
    TO: language,
    FROM: from,
    TEXT: result.text
  }

  return replacer(template, replace).trim()
}
