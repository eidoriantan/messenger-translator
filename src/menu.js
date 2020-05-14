
const languages = require('./languages.js')
const request = require('./utils/request.js')
const getProof = require('./proof.js')

const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

/**
 *  Updates user's menu according to its currently used language
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string[]} menu    Array of menu item IDs
 *    @return void
 */
async function setUserMenu (psid, menu) {
  const persistentMenu = [{
    locale: 'default',
    composer_input_disabled: false,
    call_to_actions: []
  }]

  menu.forEach(menuitem => {
    const language = menuitem !== '_help' ? languages[menuitem].name : ''
    persistentMenu[0].call_to_actions.push({
      type: 'postback',
      title: menuitem === '_help' ? 'Get Help' : `--language ${language}`,
      payload: menuitem === '_help' ? 'get_help' : 'change_language'
    })
  })

  const params = new URLSearchParams()
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', getProof())
  const url = `${FB_ENDPOINT}/customer_user_settings?${params.toString()}`
  const data = { psid, persistent_menu: persistentMenu }

  await request('POST', url, {}, data)
}

module.exports = { setUserMenu }
