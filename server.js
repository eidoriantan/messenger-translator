
const express = require('express')

const request = require('./src/utils/request.js')
const translator = require('./src/translate.js')
const userDB = require('./src/user-database.js')
const { parseLang } = require('./src/language.js')
const { createMenu } = require('./src/persistent-menu.js')

const app = express()

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const VALIDATION_TOKEN = process.env.VALIDATION_TOKEN

const FB_ENDPOINT = 'https://graph.facebook.com/v7.0/me'

const PORT = process.env.PORT || 8080
const DEBUG = process.env.DEBUG || false

if (!ACCESS_TOKEN || !VALIDATION_TOKEN) {
  throw new Error('Access and/or validation token was not defined')
}

/**
 *  @TODO: Validate requests integrity by verifying the 'X-HUB-SIGNATURE'
 *  with the app secret.
 */

app.use(express.json())

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const verifyToken = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && verifyToken === VALIDATION_TOKEN) {
    res.status(200).send(challenge)
    return true
  } else {
    res.status(403).send('Verification token does not match!')
    return false
  }
})

app.post('/webhook', (req, res) => {
  const data = req.body
  if (data.object !== 'page') {
    console.error('Object is not a page: ')
    console.error(data)
    res.status(403).send('Object is not a page')
    return false
  }

  data.entry.forEach(entry => {
    entry.messaging.forEach(event => {
      if (DEBUG) {
        console.log('A new event was received: ')
        console.log(event)
      }

      handleEvent(event)
    })
  })

  res.status(200).send('Success')
  return true
})

/**
 *  Handles all events that are received through webhook. All received events
 *  are executed asynchronously.
 *
 *    @param {object} event    Event object sent by Facebook
 */
function handleEvent (event) {
  if (event.message) {
    receivedMessage(event)
  } else if (event.postback) {
    receivedPostback(event)
  } else {
    console.error('Unknown/unsupported event:')
    console.error(event)
  }
}

/**
 *  Handles postback events received.
 *
 *    @param {object} event    Event object sent by Facebook
 */
async function receivedPostback (event) {
  const senderID = event.sender.id
  const payload = event.postback.payload

  if (DEBUG) console.log(`Postback was called with payload: ${payload}`)
  await sendTyping(senderID)

  /**
   *  Get user who sent the event from the database or add the user if was not
   *  found.
   */
  const user = await userDB.getUser(senderID) || await userDB.addUser(senderID)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  switch (payload) {
    case 'get_started':
      await sendMessage(senderID, 'Hi there! Type anything and I\'ll ' +
        'translate it to English. You can also change the language by ' +
        'accessing the menu.')
      break

    case 'LANG_EN':
    case 'LANG_JA':
    case 'LANG_KO':
      if (DEBUG) console.log('Updating user database')
      await userDB.setUser(senderID, { language: payload })
      if (DEBUG) console.log('Updating user for new menu')
      await sendNewMenu(senderID, payload)
      await sendMessage(senderID,
        `Language was changed to ${parseLang(payload).name}!`)
      break

    default:
      console.error('Unknown/unsupported payload')
      console.error(payload)
  }
}

/**
 *  Handles all messages received.
 *
 *    @param {object} event    Event object sent by Facebook
 */
async function receivedMessage (event) {
  const senderID = event.sender.id
  const message = event.message
  const text = message.text

  if (DEBUG) console.log(`Message was received with text: ${text}`)
  await sendTyping(senderID)

  const user = await userDB.getUser(senderID) || await userDB.addUser(senderID)
  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  // Translate the message with the user's prefered language
  const translated = await translator.translate(text, user.language)
  await sendMessage(senderID, translated)
}

/**
 *  Sends a message to user by calling Messenger's Send API.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string} text    The message to send
 */
async function sendMessage (psid, text) {
  const url = `${FB_ENDPOINT}/messages?access_token=${ACCESS_TOKEN}`
  const data = {
    messaging_type: 'RESPONSE',
    recipient: { id: psid },
    message: { text }
  }

  if (DEBUG) console.log(`Sending user "${psid}": ${text}`)
  await request('POST', url, {}, data)
}

/**
 *  Sends a new persistent menu to user.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string} text    Language's payload to exclude from the menu
 */
async function sendNewMenu (psid, payload) {
  const url = `${FB_ENDPOINT}/custom_user_settings?access_token=${ACCESS_TOKEN}`
  const menu = { psid, persistent_menu: createMenu(payload) }

  if (DEBUG) {
    console.log(`Sending user new menu"${psid}"`)
    console.log(menu)
  }

  await request('POST', url, {}, menu)
}

/**
 *  Sends user a typing on indicator.
 *
 *    @param {string} psid    User's page-scoped ID
 */
async function sendTyping (psid) {
  const url = `${FB_ENDPOINT}/messages?access_token=${ACCESS_TOKEN}`
  const data = {
    messaging_type: 'RESPONSE',
    recipient: { id: psid },
    sender_action: 'typing_on'
  }

  if (DEBUG) { console.debug('Sending user typing on action') }
  await request('POST', url, {}, data)
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = { app, server }
