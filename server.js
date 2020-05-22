
/**
 *  Copyright 2020 Adriane Justine Tan
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const express = require('express')
const crypto = require('crypto')

const send = require('./src/utils/send.js')
const translator = require('./src/translate.js')
const userDB = require('./src/user-database.js')
const { changeLanguage } = require('./src/language.js')

const app = express()

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const VALIDATION_TOKEN = process.env.VALIDATION_TOKEN
const APP_SECRET = process.env.APP_SECRET
const PORT = process.env.PORT || 8080
const DEBUG = process.env.DEBUG

if (!ACCESS_TOKEN || !VALIDATION_TOKEN || !APP_SECRET) {
  throw new Error('Access, App Secret and/or validation token was not defined')
}

app.use(express.json({
  verify: (req, res, buf) => {
    const signature = req.get('x-hub-signature')
    if (!signature) throw new Error('No signature')

    const elements = signature.split('=')
    const method = elements[0]
    const hash = elements[1]
    const expected = crypto.createHmac(method, APP_SECRET)
      .update(buf)
      .digest('hex')

    if (hash !== expected) throw new Error('Invalid signature')
  }
}))

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

      if (event.message) {
        receivedMessage(event)
      } else if (event.postback) {
        receivedPostback(event)
      } else {
        console.error('Unknown/unsupported event:')
        console.error(event)
      }
    })
  })

  res.status(200).send('Success')
  return true
})

/**
 *  Handles postback events received.
 *
 *    @param {object} event    Event object sent by Facebook
 *    @return void
 */
async function receivedPostback (event) {
  const senderID = event.sender.id
  const postback = event.postback
  const payload = postback.payload

  if (DEBUG) console.log(`Postback was called with payload: ${payload}`)

  await send(senderID, null, 'mark_seen')
  await send(senderID, null, 'typing_on')
  const user = await userDB.getUser(senderID) || await userDB.addUser(senderID)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  switch (payload) {
    case 'get_started':
    case 'get_help':
      await sendHelp(user.psid, user.locale)
      break

    case 'change_language': {
      const language = postback.title.split('--language ')[1]
      const response = await changeLanguage(user, language)
      await send(user.psid, response)
      break
    }

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

  if (DEBUG) console.log(`Message was received with text: ${text}`)

  await send(senderID, null, 'mark_seen')
  await send(senderID, null, 'typing_on')
  const user = await userDB.getUser(senderID) || await userDB.addUser(senderID)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const langRegex = /^(-?-?lang(uage)? (.+))$/i
  const help = /^(-?-?help)$/i
  const disable = /^(--?disable)$/i
  const enable = /^(--?enable)$/i
  let response = ''

  if (text.match(help) !== null) return await sendHelp(user.psid, user.locale)
  else if (text.match(langRegex) !== null) {
    const language = langRegex.exec(text)[3]
    response = await changeLanguage(user, language)
  } else if (text.match(disable) !== null) {
    response = await disableDetailed(user.psid)
  } else if (text.match(enable) !== null) {
    response = await enableDetailed(user.psid)
  } else {
    const { language, detailed, locale } = user
    const help = 'For help, type " --help "'
    let footer = ''

    if (detailed) {
      footer = locale !== 'en_US'
        ? await translator.translate(help, locale.split('_')[0], false)
        : help
    }

    response = await translator.translate(text, language, detailed) +
      '\r\n\r\n' + footer
  }

  await send(user.psid, response.trim())
}

/**
 *  Simply sends the help message to the user
 *
 *    @param {string} psid    User's page-scoped ID
 *    @param {string} locale    User's locale
 *    @return void
 */
async function sendHelp (psid, locale) {
  let message = 'Translator Help\r\n'
  message += 'Type " --disable / --enable " to toggle detailed mode\r\n'
  message += 'Type " --language LANGUAGE " to change language\r\n'
  message += 'For example:\r\n'

  const example = '--language japanese'
  const language = locale ? locale.split('_')[0] : 'en'

  if (language !== 'en') {
    message = await translator.translate(message, language, false)
  }

  await send(psid, message + example)
}

/**
 *  Removes the details such as "Translated To:", "Translated From", etc. in
 *  every messages.
 *
 *    @param {string} psid    User-scoped page ID
 *    @return {string} message
 */
async function disableDetailed (psid) {
  await userDB.setUser(psid, { detailed: false })
  return 'Detailed mode was disabled'
}

/**
 *  Re-enables the details in every messages.
 *
 *    @param {string} psid    User-scoped page ID
 *    @return {string} message
 */
async function enableDetailed (psid) {
  await userDB.setUser(psid, { detailed: true })
  return 'Detailed mode was enabled'
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

server.on('close', async () => {
  console.log('Server is closing...')
  console.log('MySQL server is closing...')
  const pool = await userDB.poolAsync
  pool.close()
})

module.exports = { app, server }
