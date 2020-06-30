
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
const profile = require('./profile.js')

const SERVER = process.env.SERVER
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE

if (!SERVER || !USERNAME || !PASSWORD || !DATABASE) {
  throw new Error('Server connection configuration was not defined')
}

const config = {
  server: SERVER,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE,
  pool: { min: 1 },
  options: {
    enableArithAbort: true,
    encrypt: true
  }
}

const poolAsync = new Promise((resolve, reject) => {
  console.log('Connecting to MySQL server...')
  try {
    const pool = sql.connect(config)
    console.log('Connected to MySQL server!')
    resolve(pool)
  } catch (error) {
    reject(error)
  }
})

/**
 *  Returns the data type of the name in the database
 *
 *  @param {string} name    The name in the database
 *  @return {SQLDataType} data type
 */
function getDataType (name) {
  let dataType
  switch (name) {
    case 'psid':
    case 'language':
    case 'locale':
      dataType = sql.NVarChar(16)
      break

    case 'name':
    case 'menu':
      dataType = sql.NVarChar(255)
      break
  }

  return dataType
}

/**
 *  Asynchronous function that adds a user to the database.
 *
 *  @param {string} psid    User's page-scoped ID
 *  @return {object} userData
 */
async function addUser (psid) {
  const fbProfile = await profile.getProfile(psid)
  const userData = {
    psid,
    name: fbProfile.name || '',
    language: 'en',
    locale: fbProfile.locale || 'en_US',
    menu: ['en', 'ja', '_help']
  }

  try {
    const pool = await poolAsync
    const request = pool.request()
    const names = []

    for (const name in userData) {
      const dataType = getDataType(name)
      const value = userData[name]

      names.push(name)
      request.input(name, dataType, value)
    }

    const values = names.map(name => `@${name}`).join(', ')
    const query = `INSERT INTO users (${names.join(', ')}) VALUES (${values})`
    await request.query(query)
  } catch (error) {
    logger.write(`Unable to add user to database: ${psid}`)
    logger.write(`Error: ${error.message}`)
    logger.write(`Stack: ${error.stack}`)
    logger.write('Profile:')
    logger.write(fbProfile)
    logger.write('User Data:')
    logger.write(userData)
  }

  return userData
}

/**
 *  Deletes a user in the database
 *
 *  @param {string} psid    User's page-scoped ID
 */
async function deleteUser (psid) {
  try {
    const pool = await poolAsync
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)
    await request.query('DELETE FROM users WHERE psid=@psid')
  } catch (error) {
    logger.write(`Unable to delete user from database: ${psid}`)
    logger.write(`Error: ${error.message}`)
    logger.write(`Stack: ${error.stack}`)
  }
}

/**
 *  Asynchronous function that gets the user data from the database.
 *
 *  @param {string} psid    User's page-scoped ID
 *  @return {object} userData
 */
async function getUser (psid) {
  try {
    const pool = await poolAsync
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)

    const result = await request.query('SELECT * FROM users WHERE psid=@psid')
    const parseUser = user => {
      user.menu = user.menu.split(',')
      return user
    }

    return result.recordset.length > 0 ? parseUser(result.recordset[0]) : null
  } catch (error) {
    logger.write(`Unable to get user information: ${psid}`)
    logger.write(`Error: ${error.message}`)
    logger.write(`Stack: ${error.stack}`)
  }

  return null
}

/**
 *  Asynchronous function that updates the user data to the database.
 *
 *  @param {string} psid      User's page-scoped ID
 *  @param {object} values    Array of { key: value } to update the database
 *
 *  @return void
 */
async function setUser (psid, values) {
  try {
    const pool = await poolAsync
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)
    const names = []

    for (const name in values) {
      const dataType = getDataType(name)
      const value = values[name]

      names.push(name)
      request.input(name, dataType, value)
    }

    const columns = names.map(name => `${name}=@${name}`).join(', ')
    await request.query(`UPDATE users SET ${columns} WHERE psid=@psid`)
  } catch (error) {
    logger.write(`Unable to update user information: ${psid}`)
    logger.write(`Error: ${error.message}`)
    logger.write(`Stack: ${error.stack}`)
  }
}

module.exports = { poolAsync, addUser, deleteUser, getUser, setUser }
