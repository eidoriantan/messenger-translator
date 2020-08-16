
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

const directory = path.resolve(__dirname, '../../logs')
if (!fs.existsSync(directory)) fs.mkdirSync(directory)

const infoLog = path.resolve(directory, 'info.log')
const errorlog = path.resolve(directory, 'error.log')

const infoStream = fs.createWriteStream(infoLog, { flags: 'a' })
const errorStream = fs.createWriteStream(errorlog, { flags: 'a' })

/**
 *  Writes data to `error.log`
 *
 *  @param {mixed} data    Data to log
 *  @param {int} level     0 = info, 1 = error
 *
 *  @return {string} chunk
 */
function write (data, level = 0) {
  const date = new Date().toISOString()
  let chunk = ''

  switch (typeof data) {
    case 'string':
      chunk += `[${date}]: ${data}\r\n`
      break

    case 'number':
      chunk += `[${date}]: ${data.toString()}\r\n`
      break

    case 'object':
      if (data instanceof Error) {
        chunk += `[${date}]: ${data.message}\r\n`
        chunk += `${data.stack}\r\n`
      } else chunk += `${JSON.stringify(data, null, 2)}\r\n`
      break

    case 'undefined':
      chunk += `[${date}]: undefined\r\n`
      break

    default:
      chunk += `[${date}]: ${data.toString()}\r\n`
  }

  switch (level) {
    case 0:
      infoStream.write(chunk)
      break

    case 1:
      errorStream.write(chunk)
      break
  }

  return chunk
}

/**
 *  Closes the file write stream
 *  @return void
 */
function close () {
  infoStream.end()
  errorStream.end()
}

module.exports = { write, close, directory }
