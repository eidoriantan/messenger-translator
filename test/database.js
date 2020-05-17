
const userDB = require('../src/user-database.js')
require('should')

const TEST_USERID = process.env.TEST_USERID
process.env.DEBUG = true

if (!TEST_USERID) throw new Error('Test user ID was not defined')

describe('User Database test', async () => {
  const pool = await userDB.init()
  let testUser

  it('Adds user', async () => {
    const userData = await userDB.addUser(pool, TEST_USERID)
    userData.should.containEql({ psid: TEST_USERID })
    userData.should.containEql({ name: '' })
    userData.should.containEql({ language: 'en' })
    userData.should.containEql({ detailed: true })
    userData.should.containEql({ locale: 'en_US' })
    userData.should.containEql({ menu: ['en', 'ja', '_help'] })
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await userDB.getUser(pool, testUser.psid)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    await userDB.setUser(pool, testUser.psid, {
      language: 'ja',
      detailed: false
    })

    testUser.language = 'ja'
    testUser.detailed = false
    const userData = await userDB.getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  after(async () => {
    await userDB.deleteUser(pool, testUser.psid)
    await userDB.close(pool)
  })
})
