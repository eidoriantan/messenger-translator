
const crypto = require('crypto')

const APP_SECRET = process.env.APP_SECRET
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

/**
 *  Simple returns a hashed app secret proof to secure the Facebook API requests
 *
 *    @return {string} proof
 */
function getProof () {
  return crypto.createHmac('sha256', APP_SECRET)
    .update(ACCESS_TOKEN)
    .digest('hex')
}

module.exports = getProof
