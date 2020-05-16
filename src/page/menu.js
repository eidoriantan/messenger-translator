
const request = require('../utils/request.js')
const getProof = require('../utils/proof.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

/**
 *  Setting the "Persistent Menu" property
 */
async function setMenu () {
  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/messenger_profile?${params.toString()}`
  const data = {
    persistent_menu: [{
      locale: 'default',
      composer_input_disabled: false,
      call_to_actions: [{
        type: 'postback',
        title: '--language English',
        payload: 'change_language'
      }, {
        type: 'postback',
        title: '--language Japanese',
        payload: 'change_language'
      }, {
        type: 'postback',
        title: 'Get Help',
        payload: 'get_help'
      }]
    }]
  }

  console.log('Setting `Persistent Menu`')
  console.log(data)
  const response = await request('POST', url, {}, data)
  console.log(response)
}

setMenu()
