
const sql = require('mssql')
const { getProfile } = require('./user-fb.js')

/**
 *  This bot uses a SQL server for storing databases
 */
const SERVER = process.env.SERVER
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE

if (!SERVER || !USERNAME || !PASSWORD || !DATABASE) {
  console.error('Server connection configuration was not defined')
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

const poolAsync = (function () {
  return new Promise(resolve => {
    resolve(sql.connect(config))
  })
})()

/**
 *  Returns the data type of the name in the database
 *
 *    @param {string} name    The name in the database
 *    @return {SQLDataType} dataType
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

    case 'detailed':
      dataType = sql.Bit
      break
  }

  return dataType
}

/**
 *  Asynchronous function that adds a user to the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return {object} userData
 */
async function addUser (psid) {
  const profile = await getProfile(psid)
  const userData = {
    psid,
    name: profile.name || '',
    language: 'en',
    detailed: true,
    locale: profile.locale || 'en_US',
    menu: ['en', 'ja', '_help']
  }

  try {
    const pool = await poolAsync
    const request = pool.request()
    const names = []

    for (const name in userData) {
      names.push(name)
      request.input(name, getDataType(name), userData[name])
    }

    const values = names.map(name => `@${name}`)
    await request.query(
      `INSERT INTO users (${names.join(', ')}) VALUES (${values.join(', ')})`
    )
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  return userData
}

/**
 *  Deletes a user in the database
 *
 *    @param {string} psid    User's page-scoped ID
 */
async function deleteUser (psid) {
  try {
    const pool = await poolAsync
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)
    await request.query('DELETE FROM users WHERE psid=@psid')
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }
}

/**
 *  Asynchronous function that gets the user data from the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return {object} userData
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
    console.error('An error had occured!')
    console.error(error)
  }
}

/**
 *  Asynchronous function that updates the user data to the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {object} values    Array of { key: value } to update the database
 *    @return void
 */
async function setUser (psid, values) {
  try {
    const pool = await poolAsync
    const request = pool.request()
    request.input('psid', getDataType('psid'), psid)
    const names = []

    for (const name in values) {
      names.push(name)
      request.input(name, getDataType(name), values[name])
    }

    const columns = names.map(name => `${name}=@${name}`).join(', ')
    await request.query(`UPDATE users SET ${columns} WHERE psid=@psid`)
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }
}

module.exports = { poolAsync, addUser, deleteUser, getUser, setUser }
