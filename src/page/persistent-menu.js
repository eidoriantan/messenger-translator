
const request = require('../request.js')
const { createMenu } = require('../persistent-menu.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

async function sendMenu () {
  const url = `${FB_ENDPOINT}/messenger_profile?access_token=${ACCESS_TOKEN}`
  const data = { persistent_menu: createMenu('LANG_EN') }

  console.log('Setting persistent menu: ')
  console.log(data)
  const response = await request('POST', url, {}, data)
  console.log(response)
}

sendMenu()
