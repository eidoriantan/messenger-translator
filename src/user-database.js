
const sql = require('mssql')
const { getProfile } = require('./user-fb.js')

/**
 *  This bot uses a SQL server for storing databases
 */
const SERVER = process.env.SERVER
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE

const config = {
  server: SERVER,
  user: USERNAME,
  password: PASSWORD,
  database: DATABASE
}

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
      dataType = sql.VarChar(16)
      break

    case 'name':
    case 'menu':
      dataType = sql.VarChar(255)
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
  let pool
  const profile = await getProfile(psid)
  const userData = {
    psid,
    name: profile.name,
    language: 'en',
    detailed: true,
    locale: profile.locale,
    menu: ['en', 'ja', '_help']
  }

  try {
    pool = await sql.connect(config)
    const request = new sql.Request(pool)
    let names = []

    for (const name in userData) {
      names.push(name)
      request.input(name, getDataType(name), userData[name])
    }

    const values = names.map(name => `@${name}`).join()
    names = names.join(', ')

    await request.query(`INSERT INTO users (${names}) VALUES (${values})`)
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  if (pool) pool.close()
  return userData
}

async function deleteUser (psid) {
  let pool
  try {
    pool = await sql.connect(config)
    const request = new sql.Request(pool)
    request.input('psid', getDataType('psid'), psid)
    await request.query('DELETE FROM users WHERE psid=@psid')
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  if (pool) pool.close()
}

/**
 *  Asynchronous function that gets the user data from the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return {object} userData
 */
async function getUser (psid) {
  let pool, userData
  try {
    pool = await sql.connect(config)
    const request = new sql.Request(pool)
    request.input('psid', getDataType('psid'), psid)
    const result = await request.query('SELECT * FROM users WHERE psid=@psid')

    userData = result.recordset.length > 0 ? result.recordset[0] : null
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  if (pool) pool.close()
  return userData
}

/**
 *  Asynchronous function that updates the user data to the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {object[]} values    Array of { key: value } to update the database
 *    @return void
 */
async function setUser (psid, values) {
  let pool
  try {
    pool = await sql.connect(config)
    const request = new sql.Request(pool)
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

  if (pool) pool.close()
}

module.exports = { addUser, deleteUser, getUser, setUser }
