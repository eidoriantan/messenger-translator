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

const https = require('https')

/**
 *  Sends a HTTPS request. Used specifically for sending/receiving JSON data
 *
 *  @param {string} method           Supports all HTTP methods
 *  @param {string} url              Target URL
 *  @param {object} headers          Custom headers to include
 *  @param {object|object[]} data    Data to send along with the request
 *
 *  @return {Promise} response
 */
module.exports = function (method, url, headers = {}, data = null) {
  const json = JSON.stringify(data)
  const options = {
    method: method.toUpperCase(),
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8'
    }
  }

  return new Promise((resolve, reject) => {
    const request = https.request(url, options, message => {
      const response = {
        message: message.statusMessage,
        status: message.statusCode,
        headers: message.headers,
        body: []
      }

      message.setEncoding('utf-8')
      message.on('data', chunk => response.body.push(chunk))
      message.on('end', () => {
        response.body = response.body.join('')
        try { response.body = JSON.parse(response.body) } catch (error) {}
        resolve(response)
      })
    })

    for (const header in headers) request.setHeader(header, headers[header])

    if (data !== null) {
      request.setHeader('Content-Length', Buffer.byteLength(json))
      request.write(json)
    }

    request.on('error', error => reject(error))
    request.end()
  })
}
