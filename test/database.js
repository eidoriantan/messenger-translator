
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

const database = require('../src/database.js')
require('should')

const TEST_USERID = process.env.TEST_USERID
process.env.DEBUG = true

if (!TEST_USERID) throw new Error('Test user ID was not defined')

describe('User Database test', async () => {
  let testUser

  it('Adds user', async () => {
    const userData = await database.addUser(TEST_USERID)
    userData.should.containEql({ psid: TEST_USERID })
    userData.should.containEql({ name: '' })
    userData.should.containEql({ language: 'en' })
    userData.should.containEql({ locale: 'en_US' })
    userData.should.containEql({ menu: ['en', 'ja', '_help'] })
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await database.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    await database.setUser(testUser.psid, { language: 'ja' })

    testUser.language = 'ja'
    const userData = await database.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  after(async () => {
    await database.deleteUser(testUser.psid)
  })
})
