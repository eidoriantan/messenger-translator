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

const fs = require('fs')
const path = require('path')
const ini = require('ini')

const localeDir = path.resolve(__dirname)
const translations = fs.readdirSync(localeDir)
const strings = {}

translations.forEach(file => {
  if (!file.match(/(\.ini)$/i)) return

  const filepath = path.join(localeDir, file)
  const filedata = fs.readFileSync(filepath, 'utf8')
  const translation = ini.parse(filedata)
  const parsed = {}

  for (const key in translation.text) {
    const multilineRegex = /^(\w+)\.\d$/
    const match = key.match(multilineRegex)

    if (match) {
      const parsedKey = match[1]
      const text = translation.text[key].toString()

      if (typeof parsed[parsedKey] === 'undefined') parsed[parsedKey] = text
      else parsed[parsedKey] += `\r\n${text}`
    } else parsed[key] = translation.text[key]
  }

  strings[translation.iso] = parsed
})

/**
 *  Get locale string
 *
 *  @param {string} locale    String locale
 *  @param {string} name      String name
 *
 *  @return {string} text
 */
module.exports = function (locale, name) {
  locale = locale ? locale.split('_')[0] : 'en'
  const text = strings[locale] || strings.en
  return text[name]
}
