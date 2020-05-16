
const {
  addUser, deleteUser, getUser, setUser
} = require('../src/user-database.js')
require('should')

const TEST_USERID = process.env.TEST_USERID
process.env.DEBUG = true

if (!TEST_USERID) throw new Error('Test user ID was not defined')

describe('User Database test', () => {
  let testUser
  it('Adds user', async () => {
    const userData = await addUser(TEST_USERID)
    userData.should.containEql({ psid: TEST_USERID })
    userData.should.containEql({ name: '' })
    userData.should.containEql({ language: 'en' })
    userData.should.containEql({ detailed: true })
    userData.should.containEql({ locale: 'en_US' })
    userData.should.containEql({ menu: ['en', 'ja', '_help'] })
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    await setUser(testUser.psid, {
      language: 'ja',
      detailed: false
    })

    testUser.language = 'ja'
    testUser.detailed = false
    const userData = await getUser(testUser.psid)
    userData.should.containDeep(testUser)
  })

  after(async () => await deleteUser(testUser.psid))
})
