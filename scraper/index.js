const phantom = require('phantom')

module.exports = {
  test: async () => {
    const instance = await phantom.create()
    const page = await instance.createPage()

    await page.property('viewportSize', { width: 1024, height: 600 })
    const status = await page.open('https://stackoverflow.com/')
    console.log(`Page opened with status [${status}].`)

    await page.render('stackoverflow.pdf')
    console.log(`File created at [./stackoverflow.pdf]`)

    await instance.exit()
  },


  run: async (config) => {
    // Initialize phantom
    const instance = await phantom.create()
    const page = await instance.createPage()
    const status = await page.open(config.url)

    // Handle page load
    await page.on('onLoadFinished', async function(data) {
      console.log('\n\n')
      console.log('Load finished, outputting content: \n')
      var content = await page.property('content')
      console.log(content)
    })

    // URL Change
    await page.on('onUrlChanged', function(url) {
      console.log('\n\n')
      console.log('Url Changed, data output:')
      console.log(url)
    })

    if(status === 'success'){
      console.log('filling out login form')
      page.evaluate(function() {
        var email_input = document.querySelector('input#session_key-login')
        var password_input = document.querySelector('input#session_password-login')
        var submit_button = document.querySelector('input[type=submit]')

        email_input.value = 'ej@sequential.tech'
        password_input.value = 'foxb7679'
        submit_button.click()
      })
    } else{
      console.log('failed to load')
      await instance.exit()
      return false
    }

  }
}
