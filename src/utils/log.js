
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

const errorlog = path.resolve(directory, 'error.log')
const stream = fs.createWriteStream(errorlog, { flags: 'a' })

/**
 *  Writes data to `error.log`
 *
 *  @param {mixed} data    Data to log
 *  @return {string} chunk
 */
function write (data) {
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

  stream.write(chunk)
  return chunk
}

/**
 *  Closes the file write stream
 */
function close () {
  stream.end()
}

module.exports = { write, close, directory }
