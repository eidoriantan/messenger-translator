
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
const table = process.env.DEVELOPMENT ? 'users_test' : 'users'
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
 *  @param {string} psid       User's page-scoped ID
 *  @param {object} profile    User's profile object
 *
 *  @return {object} userData
 */
async function addUser (psid, profile) {
  const userData = {
    psid,
    name: profile.name || '',
    language: 'en',
    locale: profile.locale || 'en_US',
    menu: ['en', 'ja', '_help']
  }

  try {
    const pool = await sql.connect()
    const request = pool.request()
    const names = []

    for (const name in userData) {
      const dataType = getDataType(name)
      const value = userData[name]

      names.push(name)
      request.input(name, dataType, value)
    }

    const namesStr = names.join(', ')
    const values = names.map(name => `@${name}`).join(', ')
    const query = `INSERT INTO ${table} (${namesStr}) VALUES (${values})`
    await request.query(query)
  } catch (error) {
    logger.write(`Unable to add user to database: ${psid}`, 1)
    logger.write(error, 1)
    logger.write('Profile:', 1)
    logger.write(profile, 1)
    logger.write('User Data:', 1)
    logger.write(userData, 1)
  }

  return userData
}

/**
 *  Deletes a user in the database
 *
 *  @param {string} psid    User's page-scoped ID
 *  @return void
 */
async function deleteUser (psid) {
  try {
    const pool = await sql.connect()
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)
    await request.query(`DELETE FROM ${table} WHERE psid=@psid`)
  } catch (error) {
    logger.write(`Unable to delete user from database: ${psid}`, 1)
    logger.write(error, 1)
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
    const pool = await sql.connect()
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)

    const query = `SELECT * FROM ${table} WHERE psid=@psid`
    const result = await request.query(query)
    const parseUser = user => {
      user.menu = user.menu.split(',')
      return user
    }

    return result.recordset.length > 0 ? parseUser(result.recordset[0]) : null
  } catch (error) {
    logger.write(`Unable to get user information: ${psid}`, 1)
    logger.write(error, 1)
    return null
  }
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
    const pool = await sql.connect()
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
    await request.query(`UPDATE ${table} SET ${columns} WHERE psid=@psid`)
  } catch (error) {
    logger.write(`Unable to update user information: ${psid}`, 1)
    logger.write(error, 1)
  }
}

/**
 *  Closes the SQL pool connection
 */
function close () {
  console.log('SQL server is closing...')
  sql.close()
}

module.exports = { addUser, deleteUser, getUser, setUser, close }
