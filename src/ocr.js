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
const Tesseract = require('tesseract.js')
const logger = require('./utils/log.js')

const DEBUG = process.env.DEBUG || false
const langPath = path.resolve(__dirname, '../tessdata')
const cachePath = path.resolve(__dirname, '../cache')
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath)

const langFiles = fs.readdirSync(langPath)
const langRegex = /([^.]+)\.traineddata/i

const workerAsync = (async () => {
  console.log('Loading worker')
  const worker = Tesseract.createWorker({
    logger: DEBUG ? msg => console.log(msg) : () => {},
    langPath,
    cachePath
  })

  const langs = langFiles
    .filter(filename => filename.match(langRegex))
    .map(filename => langRegex.exec(filename)[1])
    .join('+')

  await worker.load()
  await worker.loadLanguage(langs)
  await worker.initialize(langs)

  return worker
})()

/**
 *  Extracts text from an image
 *
 *  @param {string} url    Image URL
 *  @return {string[]} text
 */
async function recognize (url) {
  const worker = await workerAsync
  try {
    const result = await worker.recognize(url)
    const lines = result.data.lines
    return lines.filter(line => line.confidence > 60).map(line => line.text)
  } catch (error) {
    logger.write('Error recognizing image', 1)
    logger.write(error)
    return []
  }
}

/**
 *  Closes the worker
 *  @return void
 */
async function close () {
  const worker = await workerAsync
  return await worker.terminate()
}

module.exports = { recognize, close }
