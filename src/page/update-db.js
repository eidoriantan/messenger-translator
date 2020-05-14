
const request = require('../utils/request.js')
const { getProfile } = require('../user-fb.js')

const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/msgr-translator'
const DB_API_KEY = process.env.DB_API_KEY

/**
 *  Updating the users on the database with their names
 */
async function updateUsers () {
  const headers = { 'X-APIKEY': DB_API_KEY }
  const response = await request('GET', DB_ENDPOINT, headers)

  console.log('All users was retrieved')
  response.body.forEach(async user => {
    console.log('Getting user: ' + user.psid)
    const profile = await getProfile(user.psid)
    await request('PATCH', `${DB_ENDPOINT}/${user._id}`, headers, {
      name: profile.name,
      locale: profile.locale || 'en_US'
    })
  })
}

updateUsers()
