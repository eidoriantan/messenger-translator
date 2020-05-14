
const request = require('./utils/request.js')
const { getProfile } = require('./user-fb.js')

/**
 *  The bot is using `restdb.io` API to store the user's preferences/settings
 */
const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/msgr-translator'
const DB_API_KEY = process.env.DB_API_KEY
const DEBUG = process.env.DEBUG || false

/**
 *  Asynchronous function that adds a user to the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return {object} userData
 */
async function addUser (psid) {
  // Default user data
  const profile = await getProfile(psid)
  const userData = {
    psid,
    name: profile.name,
    language: 'en',
    detailed: true,
    locale: profile.locale
  }

  try {
    const headers = { 'X-APIKEY': DB_API_KEY }
    const response = await request('POST', DB_ENDPOINT, headers, userData)
    userData._id = response.body._id

    if (response.status >= 400) {
      console.error('A non-"OK" status was returned but didn\'t throw an error')
      console.error(response)
    }

    if (DEBUG && response.status >= 200 && response.status < 300) {
      console.log('A new user was created: ')
      console.log(`PSID ---> ${response.body.psid}`)
      console.log(`Object ID ---> ${response.body._id}`)
    }
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  return userData
}

/**
 *  Asynchronous function that gets the user data from the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return {object} userData
 */
async function getUser (psid) {
  let userData

  try {
    const query = encodeURIComponent(JSON.stringify({ psid }))
    const headers = { 'X-APIKEY': DB_API_KEY }
    const url = `${DB_ENDPOINT}?q=${query}`
    const response = await request('GET', url, headers)
    userData = response.body.length > 0 ? response.body[0] : null

    if (DEBUG) {
      console.log(`Trying to get user with PSID "${psid}": `)
      console.log(userData)
    }

    if (response.status >= 400) {
      console.error('A non-"OK" status was returned but didn\'t throw an error')
      console.error(response)
    }
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  return userData
}

/**
 *  Asynchronous function that updates the user data to the database.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {object[]} values    Array of { key: value } to update the database
 *    @return {object} userData
 */
async function setUser (psid, values) {
  let userData = null

  try {
    userData = await getUser(psid) || await addUser(psid)
    const headers = { 'X-APIKEY': DB_API_KEY }
    const url = `${DB_ENDPOINT}/${userData._id}`
    for (const key in values) userData[key] = values[key]
    const response = await request('PATCH', url, headers, userData)

    if (response.status >= 400) {
      console.error('A non-"OK" status was returned but didn\'t throw an error')
      console.error(response)
    }

    if (DEBUG && response.status >= 200 && response.status < 300) {
      console.log('A user was updated: ')
      console.log(`PSID ---> ${response.body.psid}`)
      console.log(`Object ID ---> ${response.body._id}`)
    }
  } catch (error) {
    console.error('An error had occured!')
    console.error(error)
  }

  return userData
}

module.exports = { addUser, getUser, setUser }
