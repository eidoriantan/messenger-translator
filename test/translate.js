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

/* eslint-env mocha */

const should = require('should')
const translate = require('../src/translate.js')

describe('Translator', () => {
  it('Translate text', async () => {
    const result = await translate('hello', {
      language: 'ja',
      locale: 'en'
    })

    result.includes('こんにちは').should.be.true()
  })

  it('Message only', async () => {
    const message = 'こんにちは\npronunciation: konnichiwa'
    const result = await translate('hello', {
      language: 'ja',
      message: 1
    })

    should.strictEqual(result, message)
  })

  it('Change locale', async () => {
    const result = await translate('hello', {
      language: 'ja',
      locale: 'tl'
    })

    result.should.endWith('Para sa tulong, i-type "--help"')
  })
})
