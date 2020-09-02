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

const sql = require('mssql')
const logger = require('./utils/log.js')

const SERVER = process.env.SERVER
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE

if (!SERVER || !USERNAME || !PASSWORD || !DATABASE) {
  throw new Error('Server connection configuration was not defined')
}

console.log('Connecting to SQL server...')
const config = {
  server: SERVER,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  options: {
    enableArithAbort: true,
    encrypt: true
  }
}

sql.connect(config).then(() => {
  console.log('Connected to SQL server!')
})

/**
 *  Begins a transaction and runs a query
 *
 *  @param {string} query      Query string
 *  @param {array[]} inputs    Array of input (parameters of request.input)
 *
 *  @return {object}
 */
async function query (query, inputs = []) {
  await sql.connect()
  return new Promise((resolve, reject) => {
    const transaction = new sql.Transaction()
    transaction.begin(error => {
      if (error) {
        logger.write('An error occured when starting a transaction:')
        logger.write(error, 1)
        reject(error)
      }

      const request = new sql.Request()
      inputs.forEach(input => request.input(...input))
      request.query(query, (error, result) => {
        if (error) {
          logger.write('An error occured when querying command:')
          logger.write(error, 1)
          reject(error)
        }

        transaction.commit()
        resolve(result)
      })
    })
  })
}

/**
 *  Closes the SQL pool connection
 *  @return void
 */
function close () {
  console.log('SQL server is closing...')
  sql.close()
}

module.exports = { query, close }
