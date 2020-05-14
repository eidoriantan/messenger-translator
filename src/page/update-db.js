
const request = require('../utils/request.js')
const getProof = require('../proof.js')

const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/msgr-translator'
const FB_ENDPOINT = 'https://graph.facebook.com'

const DB_API_KEY = process.env.DB_API_KEY
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

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
    const params = new URLSearchParams()
    params.set('fields', 'name')
    params.set('access_token', ACCESS_TOKEN)
    params.set('appsecret_proof', getProof())

    const url = `${FB_ENDPOINT}/${user.psid}?${params.toString()}`
    const userResponse = await request('GET', url)
    const profile = userResponse.body
    await request('PATCH', `${DB_ENDPOINT}/${user._id}`, headers, {
      name: profile.name
    })
  })
}

updateUsers()
