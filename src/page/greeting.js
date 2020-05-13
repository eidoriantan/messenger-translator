
const request = require('../utils/request.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

/**
 *  Setting the "Greeting" property with the text:
 *
 *    Translate messages through Messenger bot
 */
async function sendGreeting () {
  const url = `${FB_ENDPOINT}/messenger_profile?access_token=${ACCESS_TOKEN}`
  const data = {
    greeting: [{
      locale: 'default',
      text: 'Translate messages through Messenger bot'
    }]
  }

  console.log('Setting greeting: ')
  console.log(data)
  const response = await request('POST', url, {}, data)
  console.log(response)
}

sendGreeting()
