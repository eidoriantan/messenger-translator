
$.fn.attrs = function () {
  const obj = {}
  $.each(this[0].attributes, function () {
    if(this.specified) obj[this.name] = this.value
  })

  return obj
}

window.fbAsyncInit = function () {
  FB.init({
    appId: '552177775495405',
    autoLogAppEvents: true,
    version: 'v8.0'
  })

  FB.AppEvents.setAppVersion('3.13.2')
  FB.AppEvents.logPageView()

  $('[data-fbml]').each(function () {
    const element = $(this)
    const attributes = element.attrs()

    $.each(attributes, function (attr, value) {
      if (!attr.match(/^(data-fbml-)/)) return true

      const fbml = attr.split('data-fbml-')[1]
      element.attr(fbml, value)
    })
  })

  FB.XFBML.parse($('body')[0], function () {
    $('[data-fbml]').each(function () {
      const element = $(this)
      const attributes = element.attrs()

      $.each(attributes, function (attr, value) {
        if (!attr.match(/^(data-fbml)/) && !attr.match(/^(fb-)/)) return true

        if (attr.startsWith('data-fbml-')) {
          const xfbml = attr.split('data-fbml-')[1]
          element.removeAttr(xfbml)
        }

        element.removeAttr(attr)
      })
    })
  })

  FB.Event.subscribe('customerchat.dialogShow', function () {
    FB.AppEvents.logEvent('Customer Chat Clicks')
  })
}

$(document).ready(function () {
  $.ajaxSetup({ cache: true })
  $.getScript('https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js')
})
