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

const addPS = new sql.PreparedStatement()
const getPS = new sql.PreparedStatement()
const setPS = new sql.PreparedStatement()

const addQuery = `INSERT INTO ${table} (psid, name, language, locale, menu)` +
  'VALUES (@psid, @name, @language, @locale, @menu)'
const getQuery = `SELECT * FROM ${table} WHERE psid=@psid`
const setQuery = `UPDATE ${table} SET name=@name, language=@language, ` +
  'locale=@locale, menu=@menu WHERE psid=@psid'

addPS.input('psid', types.psid)
addPS.input('name', types.name)
addPS.input('language', types.language)
addPS.input('locale', types.locale)
addPS.input('menu', types.menu)

getPS.input('psid', types.psid)

setPS.input('psid', types.psid)
setPS.input('name', types.name)
setPS.input('language', types.language)
setPS.input('locale', types.locale)
setPS.input('menu', types.menu)

database.addPS(addPS)
database.addPS(getPS)
database.addPS(setPS)

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
  if (!addPS.prepared) await addPS.prepare(addQuery)

  const userData = {
    psid,
    name: profile.name,
    language: 'en',
    locale: profile.locale,
    menu: ['en', 'ja', '_help']
  }

  try {
    await addPS.execute(userData)
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
  if (!getPS.prepared) await getPS.prepare(getQuery)

  try {
    const result = await getPS.execute({ psid })
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
 *  Updates the user data
 *
 *  @param {object} user    User data object
 *  @return void
 */
async function setUser (user) {
  await sql.connect()
  if (!setPS.prepared) await setPS.prepare(setQuery)

  try {
    await setPS.execute(user)
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
    await database.query(`DELETE FROM ${table} WHERE psid=@psid`, {
      psid: {
        type: types.psid,
        value: psid
      }
    })
  } catch (error) {
    logger.write(`Unable to delete user from database: ${psid}`, 1)
    logger.write(error, 1)
  }
}

module.exports = { types, addUser, getUser, setUser, deleteUser }
