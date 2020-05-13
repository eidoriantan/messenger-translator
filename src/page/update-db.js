
const request = require('../utils/request.js')

const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/preferences'
const DB_API_KEY = process.env.DB_API_KEY

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com'

/**
 *  Updating the users on the database with their names
 */
async function updateUsers () {
  const headers = { 'X-APIKEY': DB_API_KEY }
  const response = await request('GET', DB_ENDPOINT, headers)

  console.log('All users was retrieved')
  response.body.forEach(async user => {
    if (user.name) return

    console.log('Getting user: ' + user.psid)
    const url =
      `${FB_ENDPOINT}/${user.psid}?fields=name&access_token=${ACCESS_TOKEN}`
    const userResponse = await request('GET', url)
    const profile = userResponse.body
    await request('PATCH', `${DB_ENDPOINT}/${user._id}`, headers, {
      name: profile.name
    })
  })
}

updateUsers()
