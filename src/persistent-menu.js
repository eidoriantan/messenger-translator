
/**
 *  Currently supported menu actions.
 */
const languageActions = [{
  type: 'postback',
  title: 'Switch language to English',
  payload: 'LANG_EN'
}, {
  type: 'postback',
  title: 'Switch language to Japanese',
  payload: 'LANG_JA'
}, {
  type: 'postback',
  title: 'Switch language to Korean',
  payload: 'LANG_KO'
}]

/**
 *  Creates a `Persistent Menu` property excluding the currently used language.
 *
 *    @param {string} used    Language payload of the currently used language
 *    @return {object[]} created menu
 */
function createMenu (used) {
  const actions = []
  languageActions.forEach(language => {
    if (language.payload !== used) actions.push(language)
  })

  return [{
    locale: 'default',
    composer_input_disabled: false,
    call_to_actions: actions
  }]
}

module.exports = { createMenu }
