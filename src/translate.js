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
const https = require('https')

const localeStrings = require('./locale/')
const logger = require('./utils/log.js')
const replacer = require('./utils/replacer.js')
const languages = require('./languages.js')

const PROXIES = process.env.PROXIES
const ORIGIN = process.env.ORIGIN
const DEBUG = process.env.DEBUG || false
const requests = {}

if (!PROXIES) throw new Error('Proxies are not defined')

/**
 *  Translates the text.
 *
 *  @param {string} text    Text to be translated
 *  @param {object} user    User-object retrieved from database
 *
 *  @return {string} translated text
 */
module.exports = async function (text, user) {
  let proxies = PROXIES.split(',')
  let result = null

  if (DEBUG) console.log('Calling Google Translate to translate the text')
  while (result === null) {
    if (proxies.length === 0) break

    const random = Math.floor(Math.random() * proxies.length)
    const proxy = proxies[random]
    proxies = proxies.filter(element => proxy !== element)

    if (DEBUG) console.log(`Trying proxy server: ${proxy}`)
    requests[proxy] = requests[proxy] || { success: 0, total: 0 }
    requests[proxy].total++

    try {
      result = await translate(text, { to: user.language, client: 'gtx' }, {
        request: (options, callback) => {
          /**
           *  Wrapper for proxying using `cors-anywhere`
           *  @see https://github.com/Rob--W/cors-anywhere
           */
          const url = `https://${proxy}/${options.href}`
          const opt = {
            headers: { origin: ORIGIN },
            timeout: 20000
          }

          if (url.length > 2000) {
            result = localeStrings(user.locale, 'long_message')
            throw new Error('URI is too long')
          }

          return https.request(url, opt, callback)
        }
      })

      if (result !== null) requests[proxy].success++
    } catch (e) {
      if (result) return result

      logger.write(`Proxy server (${proxy}) is not working`, 1)
      logger.write(e, 1)
    }
  }

  if (result === null) {
    if (DEBUG) console.log('Unable to translate the text')
    logger.write('Unable to translate text! Please check proxy servers', 1)

    const message = localeStrings(user.locale, 'requests_limit')
    return message
  }

  if (result.pronunciation) {
    const pronunciation = result.pronunciation
    result.text += `\r\n*pronunciation*: ${pronunciation}`
  }

  const language = languages[user.language].name
  const from = languages[result.from.language.iso]
    ? languages[result.from.language.iso].name : 'Unknown'
  const template = localeStrings(user.locale, 'body')
  const replace = {
    TO: language,
    FROM: from,
    TEXT: result.text
  }

  return replacer(template, replace).trim()
}

/**
 *  Returns the proxy servers requests status
 *  @return {object}
 */
module.exports.requests = () => {
  let success = 0
  let total = 0

  for (const key in requests) {
    success += requests[key].success
    total += requests[key].total
  }

  return {
    name: 'proxies',
    date: Date.now(),
    total: { success, total },
    requests
  }
}
