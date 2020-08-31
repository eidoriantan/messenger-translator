/**
 *  Messenger Translator
 *  Copyright (C) 2020 Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const express = require('express')
const basicAuth = require('express-basic-auth')

const localeStrings = require('./src/locale/')
const hash = require('./src/utils/hash.js')
const logger = require('./src/utils/log.js')
const send = require('./src/utils/send.js')

const database = require('./src/database.js')
const profile = require('./src/profile.js')
const translate = require('./src/translate.js')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET
const VALIDATION_TOKEN = process.env.VALIDATION_TOKEN
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const PORT = process.env.PORT || 8080
const DEBUG = process.env.DEBUG

const app = express()
const users = {}
users[USERNAME] = PASSWORD

const auth = basicAuth({ users, challenge: true })

if (!ACCESS_TOKEN || !VALIDATION_TOKEN || !APP_SECRET) {
  throw new Error('Access, App Secret and/or validation token is not defined')
}

app.use('/logs', express.static(logger.directory))

app.use((req, res, next) => {
  res.set('Content-Type', 'text/plain')
  res.set('Content-Language', 'en')
  next()
})

app.use('/webhook', express.json({
  verify: (req, res, buf) => {
    const signature = req.get('x-hub-signature')
    if (!signature) throw new Error('No signature')

    const elements = signature.split('=')
    const algo = elements[0]
    const defined = elements[1]
    const expected = hash(algo, buf, APP_SECRET)

    if (defined !== expected) {
      logger.write('Invalid signature', 1)
      logger.write(`Signature: ${signature}`, 1)
      logger.write('Body:', 1)
      logger.write(req.body, 1)

      res.status(403).send('Invalid signature')
      throw new Error('Invalid signature')
    }
  }
}))

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const verifyToken = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && verifyToken === VALIDATION_TOKEN) {
    res.status(200).send(challenge)
  } else {
    logger.write('Mode/verification token doesn\'t match', 1)
    logger.write('Parameters:', 1)
    logger.write({ mode, verifyToken, challenge }, 1)

    res.status(403).send('Mode/verification token doesn\'t match')
  }
})

app.post('/webhook', (req, res) => {
  const data = req.body
  if (data.object !== 'page') {
    logger.write('Object is not a page', 1)
    logger.write('Data:', 1)
    logger.write(data, 1)

    res.status(403).send('An error has occurred')
    return
  }

  data.entry.forEach(entry => {
    entry.messaging.forEach(event => {
      if (DEBUG) {
        console.log('A new event was received: ')
        console.log(event)
      }

      if (event.message) {
        receivedMessage(event)
        res.status(200).send('Success')
      } else if (event.postback) {
        receivedPostback(event)
        res.status(200).send('Success')
      } else {
        logger.write('Unknown/unsupported event', 1)
        logger.write('Event:', 1)
        logger.write(event, 1)

        res.status(400).send('Unknown/unsupported event')
      }
    })
  })
})

app.get('/requests', auth, (req, res) => {
  const requests = translate.requests()
  const data = JSON.stringify(requests, null, 2)

  res.set('Content-Type', 'application/json')
  res.status(200).send(data)
})

app.get('/feedbacks', auth, (req, res) => {
  database.getFeedbacks().then(feedbacks => {
    const data = JSON.stringify(feedbacks, null, 2)
    res.set('Content-Type', 'application/json')
    res.status(200).send(data)
  })
})

/**
 *  Handles received postback events.
 *
 *  @param {object} event    Event object sent by Facebook
 *  @return void
 */
async function receivedPostback (event) {
  const senderID = event.sender.id
  const postback = event.postback
  const payload = postback.payload

  if (DEBUG) console.log(`Postback was called with payload: ${payload}`)

  await send(senderID, null, 'mark_seen')
  await send(senderID, null, 'typing_on')

  let user = await database.getUser(senderID)
  if (user === null) {
    const fbProfile = await profile.getProfile(senderID)
    user = await database.addUser(senderID, fbProfile)
  }

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  switch (payload) {
    case 'get_started':
    case 'get_help': {
      const helpMessage = localeStrings(user.locale, 'help')
      await send(user.psid, helpMessage)
      break
    }

    case 'change_language': {
      const language = postback.title.split('--language ')[1]
      const response = await profile.changeLanguage(user, language)
      await send(user.psid, response)
      break
    }

    default:
      logger.write('Unknown/unsupported payload', 1)
      logger.write('Event:', 1)
      logger.write(event, 1)
  }

  await send(senderID, null, 'typing_off')
}

/**
 *  Handles all messages received.
 *
 *  @param {object} event    Event object sent by Facebook
 *  @return void
 */
async function receivedMessage (event) {
  const senderID = event.sender.id
  const message = event.message
  const text = message.text

  if (DEBUG) console.log(`Message was received with text: ${text}`)

  await send(senderID, null, 'mark_seen')
  await send(senderID, null, 'typing_on')

  let user = await database.getUser(senderID)
  if (user === null) {
    const fbProfile = await profile.getProfile(senderID)
    user = await database.addUser(senderID, fbProfile)
  }

  if (message.attachments && message.attachments.length > 0) {
    for (let i = 0; i < message.attachments.length; i++) {
      const attachment = message.attachments[i]
      const errorMsg = localeStrings(user.locale, 'attachments')

      if (!attachment.payload.sticker_id) {
        await send(senderID, errorMsg)
        break
      }
    }

    await send(senderID, null, 'typing_off')
    return
  }

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const langRegex = /^(-?-?lang(uage)? (.+))$/i
  const help = /^(-?-?help)$/i
  const feedback = /^(-?-?(feedback|fb) (.+))$/i
  let response = ''

  if (text.match(help) !== null) {
    response = localeStrings(user.locale, 'help')
  } else if (text.match(langRegex) !== null) {
    const language = langRegex.exec(text)[3]
    response = await profile.changeLanguage(user, language)
  } else if (text.match(feedback) !== null) {
    const message = feedback.exec(text)[3]
    await database.logFeedback(user.psid, user.name, message)

    response = localeStrings(user.locale, 'feedback_confirmation')
  } else {
    if (user.language === 'zh') user.language = 'zh-CN'
    response = await translate(text, user)
  }

  const result = await send(user.psid, response)
  if (!result) {
    const longMessage = localeStrings(user.locale, 'long_message')
    await send(user.psid, longMessage)
  }

  await send(senderID, null, 'typing_off')
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

process.on('uncaughtException', error => {
  logger.write('Uncaught Exception', 1)
  logger.write(`Error: ${error.message}`, 1)
  logger.write(error, 1)
})

process.on('unhandledRejection', error => {
  logger.write('Unhandled Promise rejection', 1)
  logger.write('Error:', 1)
  logger.write(error, 1)
})

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Exiting process...')
    process.exit(1)
  })
})

server.on('close', async () => {
  console.log('Server is closing...')
  logger.close()
  await database.close()
})

module.exports = { app, server }
