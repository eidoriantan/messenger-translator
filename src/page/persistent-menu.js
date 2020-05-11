
const request = require('../utils/request.js')
const { createMenu } = require('../persistent-menu.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/preferences'
const DB_API_KEY = process.env.DB_API_KEY

async function sendMenu () {
  const url = `${FB_ENDPOINT}/messenger_profile?access_token=${ACCESS_TOKEN}`
  const data = { persistent_menu: createMenu('LANG_EN') }

  console.log('Setting persistent menu: ')
  console.log(data)
  const response = await request('POST', url, {}, data)
  console.log(response)

  updateUsers()
}

async function updateUsers () {
  const headers = { 'X-APIKEY': DB_API_KEY }
  const response = await request('GET', DB_ENDPOINT, headers)

  console.log('All users was retrieved')
  response.body.forEach(async user => {
    console.log('Getting user: ' + user.psid)
    const url =
      `${FB_ENDPOINT}/custom_user_settings?access_token=${ACCESS_TOKEN}`
    const menu = { psid: user.psid, persistent_menu: createMenu(user.language) }
    await request('POST', url, {}, menu)
  })
}

sendMenu()
