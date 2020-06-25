
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

/**
 *  Replaces all strings in a format `{{ KEY }}` in a string.
 *
 *    @param {string} string    Template string
 *    @param {object} replace    Object with key-value pair
 *    @example
 *    const template = "I am {{ name }}"
 *    replace(template, { name: "Groot" }) // Returns "I am Groot"
 *
 *    @return {string} replaced string
 */
module.exports = function (string, replace) {
  for (const key in replace) {
    const regex = new RegExp(`{{ ?${key} ?}}`, 'g')
    string = string.replace(regex, replace[key])
  }

  return string
}
