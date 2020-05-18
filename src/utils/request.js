
/**
 *  Copyright 2020 Adriane Justine Tan
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const https = require('https')

/**
 *  Sends a HTTPS request. Used specifically for for sending/receiving JSON data
 *
 *    @param {string} method    Supports all HTTP methods
 *    @param {string} url    Target URL
 *    @param {object} headers    Custom headers to include with the request
 *    @param {object|object[]} data    Data to send along with the request
 *    @return {Promise} resolves the response
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
