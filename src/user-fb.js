
const request = require('./utils/request.js')
const getProof = require('./proof.js')

const FB_ENDPOINT = 'https://graph.facebook.com'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

async function getProfile (psid) {
  const params = new URLSearchParams()
  params.set('fields', 'name,locale')
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/${psid}?${params.toString()}`
  const response = await request('GET', url)

  return response.body
}

module.exports = { getProfile }
