
const should = require('should')

const request = require('../src/request.js')
const { addUser, getUser, setUser } = require('../src/user-database.js')

const DB_ENDPOINT = 'https://translator-e0ea.restdb.io/rest/preferences'
const DB_API_KEY = process.env.DB_API_KEY
const TEST_USERID = process.env.TEST_USERID
process.env.DEBUG = true

if (!TEST_USERID) throw new Error('Test user ID was not defined')

describe('User Database test', () => {
  let testUser
  it('Adds user', async () => {
    const userData = await addUser(TEST_USERID)
    userData.should.containEql({ psid: TEST_USERID })
    userData.should.containEql({ language: 'LANG_EN' })
    should.ok(userData._id)
    testUser = userData
  })

  it('Gets user', async () => {
    const userData = await getUser(testUser.psid)
    should.notEqual(userData, null)
    userData.should.containDeep(testUser)
  })

  it('Sets user property', async () => {
    const userData = await setUser(testUser.psid, { language: 'LANG_JA' })
    should.notEqual(userData, null)
    testUser.language = 'LANG_JA'
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
