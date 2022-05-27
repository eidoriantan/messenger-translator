/**
 *  Messenger Translator
 *  Copyright (C) 2020 - 2022, Adriane Justine Tan
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

/**
 *  Simply hashes a data with private key with HMAC
 *
 *  @param {string} algo    Algorithm to use
 *  @param {string} data    Data to be hashed
 *  @param {string} pkey    Private key
 *
 *  @return {string} hashed data in hex format
 */
module.exports = function (algo, data, pkey) {
  const hmac = crypto.createHmac(algo, pkey)
  return hmac.update(data).digest('hex')
}
