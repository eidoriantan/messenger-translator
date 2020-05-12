
const express = require('express')

const request = require('./src/utils/request.js')
const translator = require('./src/translate.js')
const languages = require('./src/languages.js')
const userDB = require('./src/user-database.js')

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
 *    @return void
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
 *    @return void
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
        'translate it to English. Type `--help` for help')
      break

    case 'get_help':
      await sendHelp(senderID)
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
 *    @return void
 */
async function receivedMessage (event) {
  const senderID = event.sender.id
  const message = event.message
  const text = message.text
  let response = ''

  if (DEBUG) console.log(`Message was received with text: ${text}`)
  await sendTyping(senderID)

  const user = await userDB.getUser(senderID) || await userDB.addUser(senderID)
  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const langRegex = /^(--lang(uage)? (\w+))$/i
  const disable = /^(--disable)$/i
  const enable = /^(--enable)$/i

  if (text === '--help') sendHelp(senderID)
  else if (text.match(langRegex) !== null) {
    const language = langRegex.exec(text)[3]
    response = await changeLanguage(senderID, language)
  } else if (text.match(disable) !== null) {
    response = await disableFooter(senderID)
  } else if (text.match(enable) !== null) {
    response = await enableFooter(senderID)
  } else {
    // Translate the message with the user's preferred language
    const { language, footer } = user
    const help = footer ? '\r\n*For help*, type `--help`' : ''
    response = await translator.translate(text, language) + help
  }

  await sendMessage(senderID, response)
}

/**
 *  Simply sends the help message to the user
 *
 *    @param {string} psid    User's page-scoped ID
 *    @return void
 */
async function sendHelp (psid) {
  const message = '*Translator Help*:\r\n' +
    'Type `--language [LANGUAGE NAME]` to change the language\r\n' +
    'Type `--disable` to disable the help footer every messages\r\n' +
    'Type `--enable` to re-enable the help footer'

  await sendMessage(psid, message)
}

/**
 *  Sends a message to user by calling Messenger's Send API.
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string} text    The message to send
 *    @return void
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
 *  Changes the language of the user from the database if supported
 *
 *    @param {string} psid    User-scoped page ID
 *    @param {string} lang    Name of the language
 *    @return {string} message
 */
async function changeLanguage (psid, lang) {
  let name, code

  Object.keys(languages).forEach(key => {
    const language = languages[key]
    if (language.regex.exec(lang) !== null) {
      name = language.name
      code = key
    }
  })

  if (code) {
    await userDB.setUser(psid, { language: code })
    return `Language was changed to ${name}!`
  } else return `Unknown language: ${lang}`
}

/**
 *  Disables the help footer every messages
 *
 *    @param {string} psid    User-scoped page ID
 *    @return {string} message
 */
async function disableFooter (psid) {
  await userDB.setUser(psid, { footer: false })
  return 'Footer was disabled'
}

/**
 *  Re-enables the help footer every messages
 *
 *    @param {string} psid    User-scoped page ID
 *    @return {string} message
 */
async function enableFooter (psid) {
  await userDB.setUser(psid, { footer: true })
  return 'Footer was enabled'
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
