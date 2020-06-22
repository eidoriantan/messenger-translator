
const fs = require('fs')
const path = require('path')

const directory = path.resolve(__dirname, '../../logs')
if (!fs.existsSync(directory)) fs.mkdirSync(directory)

const errorlog = path.resolve(directory, 'error.log')
const stream = fs.createWriteStream(errorlog, { flags: 'a' })

/**
 *  Writes data to `error.log`
 *
 *    @param {mixed} data    Data to log
 *    @return {string} chunk
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
