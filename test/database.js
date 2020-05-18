
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

const userDB = require('../src/user-database.js')
require('should')

const TEST_USERID = process.env.TEST_USERID
process.env.DEBUG = true

if (!TEST_USERID) throw new Error('Test user ID was not defined')

describe('User Database test', async () => {
  let testUser

  it('Adds user', async () => {
    const userData = await userDB.addUser(TEST_USERID)
    userData.should.containEql({ psid: TEST_USERID })
    userData.should.containEql({ name: '' })
    userData.should.containEql({ language: 'en' })
    userData.should.containEql({ detailed: true })
    userData.should.containEql({ locale: 'en_US' })
    userData.should.containEql({ menu: ['en', 'ja', '_help'] })
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await userDB.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    await userDB.setUser(testUser.psid, {
      language: 'ja',
      detailed: false
    })

    testUser.language = 'ja'
    testUser.detailed = false
    const userData = await userDB.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  after(async () => {
    await userDB.deleteUser(testUser.psid)
  })
})
