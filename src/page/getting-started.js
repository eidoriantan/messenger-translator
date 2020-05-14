
const request = require('../utils/request.js')
const getProof = require('../proof.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

/**
 *  Setting the "Getting Started" property with the payload `get_started`
 */
async function sendGettingStarted () {
  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/messenger_profile?${params.toString()}`
  const data = {
    get_started: { payload: 'get_started' }
  }

  console.log('Setting `Getting Started` screen: ')
  console.log(data)
  const response = await request('POST', url, {}, data)
  console.log(response)
}

sendGettingStarted()
