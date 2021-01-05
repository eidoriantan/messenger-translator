/**
 *  Messenger Translator
 *  Copyright (C) 2020 - 2021, Adriane Justine Tan
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

/* eslint-env mocha */

require('should')
const database = require('../src/database.js')
const users = require('../src/users.js')
const feedbacks = require('../src/feedbacks.js')

const userId = '0000000000000000'

describe('User Database', () => {
  let testUser = null

  it('Adds user', async () => {
    const userData = await users.addUser(userId, {
      psid: userId,
      name: 'Test Name',
      locale: 'en_US'
    })

    userData.should.containEql({ psid: userId })
    userData.should.containEql({ name: 'Test Name' })
    userData.should.containEql({ language: 'en' })
    userData.should.containEql({ locale: 'en_US' })
    userData.should.containEql({ menu: ['en', 'ja', '_help'] })
    userData.should.containEql({ message: 0 })
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await users.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    testUser.language = 'ja'
    await users.setUser(testUser)

    const userData = await users.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  it('Logs messages', async () => {
    await feedbacks.logFeedback(userId, 'test', 'DELETE THIS')
  })

  after(async () => {
    await users.deleteUser(testUser.psid)
    await feedbacks.deleteFeedback(testUser.psid)
    database.close()
  })
})
