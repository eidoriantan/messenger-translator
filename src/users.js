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
const database = require('./database.js')

const table = process.env.DEVELOPMENT ? 'users_test' : 'users'
const types = {
  psid: sql.NVarChar(16),
  language: sql.NVarChar(16),
  locale: sql.NVarChar(16),
  name: sql.NVarChar(255),
  menu: sql.NVarChar(255)
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
    name: profile.name,
    language: 'en',
    locale: profile.locale,
    menu: ['en', 'ja', '_help']
  }

  try {
    const names = []
    const inputs = []
    const values = {}

    for (const name in userData) {
      const type = types[name]

      names.push(name)
      inputs.push([name, type])
      values[name] = userData[name]
    }

    const namesStr = names.join(', ')
    const valuesStr = names.map(name => `@${name}`).join(', ')
    const query = `INSERT INTO ${table} (${namesStr}) VALUES (${valuesStr})`
    await database.query(query, inputs, values)
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
    const inputs = [['psid', types.psid]]
    const values = { psid }
    const query = `DELETE FROM ${table} WHERE psid=@psid`
    await database.query(query, inputs, values)
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
    const inputs = [['psid', types.psid]]
    const values = { psid }
    const query = `SELECT * FROM ${table} WHERE psid=@psid`
    const result = await database.query(query, inputs, values)
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
 *  @param {object} values    Array of key pair to update the database
 *
 *  @return void
 */
async function setUser (psid, values) {
  try {
    const inputs = [['psid', types.psid]]
    const psValues = { psid }
    const names = []

    for (const name in values) {
      const type = types[name]
      const value = values[name]

      names.push(name)
      inputs.push([name, type])
      psValues[name] = value
    }

    const columns = names.map(name => `${name}=@${name}`).join(', ')
    const query = `UPDATE ${table} SET ${columns} WHERE psid=@psid`
    await database.query(query, inputs, psValues)
  } catch (error) {
    logger.write(`Unable to update user information: ${psid}`, 1)
    logger.write(error, 1)
  }
}

module.exports = { types, addUser, deleteUser, getUser, setUser }
