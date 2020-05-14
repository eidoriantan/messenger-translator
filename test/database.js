
const should = require('should')

const request = require('../src/utils/request.js')
const { addUser, getUser, setUser } = require('../src/user-database.js')

const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/msgr-translator'
const DB_API_KEY = process.env.DB_API_KEY
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
    userData.should.containEql({ stats: { count: 1 } })
    should.ok(userData._id)
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await getUser(testUser.psid)
    should.notEqual(userData, null)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    const userData = await setUser(testUser.psid, {
      language: 'ja',
      detailed: false,
      stats: { count: 2 }
    })

    should.notEqual(userData, null)
    testUser.language = 'ja'
    testUser.detailed = false
    testUser.stats.count = 2
    userData.should.containDeep(testUser)
  })

  after(async () => {
    const url = `${DB_ENDPOINT}/${testUser._id}`
    const headers = { 'X-APIKEY': DB_API_KEY }
    const response = await request('DELETE', url, headers)
    should.strictEqual(response.status, 200)
    console.log(response)
  })
})
