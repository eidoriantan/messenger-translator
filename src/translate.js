/**
 *  Messenger Translator
 *  Copyright (C) 2020 - 2021, Adriane Justine Tan
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

const { Translate } = require('@google-cloud/translate').v2
const Kuroshiro = require('kuroshiro')
const Kuromoji = require('kuroshiro-analyzer-kuromoji')
const hangul = require('hangul-romanization')

const localeStrings = require('./locale/')
const logger = require('./utils/log.js')
const replacer = require('./utils/replacer.js')
const languages = require('./languages.js')

const CREDENTIALS = process.env.CREDENTIALS
const DEBUG = process.env.DEBUG || false

const credentials = JSON.parse(CREDENTIALS)
const translate = new Translate({ credentials })

const kuroshiro = new Kuroshiro()
const kuromoji = new Kuromoji()
const kuroshiroLoaded = kuroshiro.init(kuromoji)
const kuroshiroOptions = {
  to: 'romaji',
  mode: 'spaced'
}

const pronunciations = ['ja']

/**
 *  Returns how the sentence is pronunciated
 *
 *  @param {string} text        Sentence to be converted
 *  @param {string} language    Which language from
 *
 *  @return {string} pronunciation
 */
async function pronounce (text, language) {
  let pronunciation = ''
  switch (language) {
    case 'ja':
      await kuroshiroLoaded
      pronunciation = await kuroshiro.convert(text, kuroshiroOptions)
      break

    case 'ko':
      pronunciation = hangul.convert(text)
      break
  }

  return pronunciation
}

/**
 *  Translates the text.
 *
 *  @param {string} text    Text to be translated
 *  @param {object} user    User-object retrieved from database
 *
 *  @return {string} translated text
 */
module.exports = async function (text, user) {
  if (text.length > 280) return localeStrings(user.locale, 'long_message')

  if (DEBUG) console.log('Calling Google Translate to translate the text')
  const translated = await translate.translate(text, user.language)
  const result = translated ? translated[1].data.translations[0] : null

  if (result === null) {
    if (DEBUG) console.log('Unable to translate the text')
    logger.write('Unable to translate text! Please Google Cloud console', 1)

    const message = localeStrings(user.locale, 'requests_limit')
    return message
  }

  if (pronunciations.includes(user.language)) {
    const pronunciation = await pronounce(result.translatedText, user.language)
    result.translatedText += `\n**pronunciation**: ${pronunciation}`
  }

  if (user.message !== 1) {
    const language = languages[user.language].name
    const from = languages[result.detectedSourceLanguage]
      ? languages[result.detectedSourceLanguage].name
      : 'Unknown'
    const template = localeStrings(user.locale, 'body')
    const replace = {
      TO: language,
      FROM: from,
      TEXT: result.translatedText
    }

    return replacer(template, replace).trim()
  } else {
    return result.translatedText
  }
}
