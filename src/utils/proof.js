
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

const crypto = require('crypto')

const APP_SECRET = process.env.APP_SECRET
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

/**
 *  Simply returns a hashed app secret proof for Facebook API requests
 *
 *    @return {string} proof
 */
function getProof () {
  return crypto.createHmac('sha256', APP_SECRET)
    .update(ACCESS_TOKEN)
    .digest('hex')
}

module.exports = getProof
