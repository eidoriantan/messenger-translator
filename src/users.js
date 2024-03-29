/**
 *  Messenger Translator
 *  Copyright (C) 2020 - 2022, Adriane Justine Tan
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

const types = {
  psid: sql.NVarChar(16),
  name: sql.NVarChar(255),
  language: sql.NVarChar(16),
  locale: sql.NVarChar(16),
  menu: sql.NVarChar(255),
  message: sql.TinyInt
}

/**
 *  Adds a user
 *
 *  @param {string} psid       User's page-scoped ID
 *  @param {object} profile    User's profile object
 *
 *  @return {object} userData
 */
async function addUser (psid, profile) {
  await sql.connect()

  const userData = {
    psid,
    name: profile.name,
    language: 'en',
    locale: profile.locale,
    menu: ['en', 'ja', '_help'],
    message: 0
  }

  const query = 'INSERT INTO users ' +
    '(psid, name, language, locale, menu, message) VALUES ' +
    '(@psid, @name, @language, @locale, @menu, @message)'

  try {
    await database.query(query, [
      { name: 'psid', type: types.psid, value: userData.psid },
      { name: 'name', type: types.name, value: userData.name },
      { name: 'language', type: types.language, value: userData.language },
      { name: 'locale', type: types.locale, value: userData.locale },
      { name: 'menu', type: types.menu, value: userData.menu },
      { name: 'message', type: types.message, value: userData.message }
    ])
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
 *  Gets the user data
 *
 *  @param {string} psid    User's page-scoped ID
 *  @return {object} userData
 */
async function getUser (psid) {
  await sql.connect()

  const query = 'SELECT * FROM users WHERE psid=@psid'
  const parseUser = user => {
    user.menu = user.menu.split(',')
    return user
  }

  const result = await database.query(query, [
    { name: 'psid', type: types.psid, value: psid }
  ])

  return result !== null && result.recordset.length > 0
    ? parseUser(result.recordset[0])
    : null
}

/**
 *  Updates the user data
 *
 *  @param {object} user    User data object
 *  @return void
 */
async function setUser (user) {
  await sql.connect()

  const query = 'UPDATE users SET name=@name, language=@language, ' +
    'locale=@locale, menu=@menu, message=@message WHERE psid=@psid'

  try {
    await database.query(query, [
      { name: 'psid', type: types.psid, value: user.psid },
      { name: 'name', type: types.name, value: user.name },
      { name: 'language', type: types.language, value: user.language },
      { name: 'locale', type: types.locale, value: user.locale },
      { name: 'menu', type: types.menu, value: user.menu },
      { name: 'message', type: types.message, value: user.message }
    ])
  } catch (error) {
    logger.write(`Unable to update user information: ${user.psid}`, 1)
    logger.write(error, 1)
  }
}

/**
 *  Deletes a user in the database
 *
 *  @param {string} psid    User's page-scoped ID
 *  @return void
 */
async function deleteUser (psid) {
  try {
    await database.query('DELETE FROM users WHERE psid=@psid', [
      { name: 'psid', type: types.psid, value: psid }
    ])
  } catch (error) {
    logger.write(`Unable to delete user from database: ${psid}`, 1)
    logger.write(error, 1)
  }
}

module.exports = { types, addUser, getUser, setUser, deleteUser }
