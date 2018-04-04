//const logger = require('./logger').createLogger(`logs/development.log`); // logs to a file
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

    // 1) Initialize phantom
    const instance = await phantom.create()
    const page = await instance.createPage()
    const status = await page.open(config.url)

    // 2) If initial page loaded successfully, fill out login form
    if(status === 'success'){
      console.log('filling out login form')
      await page.evaluate(function() {
        var email_input = document.querySelector('input#session_key-login')
        var password_input = document.querySelector('input#session_password-login')
        var submit_button = document.querySelector('input[type=submit]')

        email_input.value = process.env.LINKEDIN_EMAIL
        password_input.value = process.env.LINKEDIN_PASSWORD
        submit_button.click()
      })
    } else{
      console.log('failed to load')
      await instance.exit()
      return false
    }

    // 3) After successful login, on the search results page (iterating)
    //  3.1) Scan for li.results
    //  3.2) Create array of result URLs by replacing last argument in li.result link URL (/people -> /insights)
    //  3.3) Navigate to result URL (iterating):
    //    3.3.1) Pull aside.insights-employee-container dl.graph-footer dd.graph-stats content (percentage growth)
    //    3.3.2) Pull aside.insights-employee-container dt.graph-footer dd.graph-stats content (company size)
    //    3.3.3) Check config windows against values, and if appropriate, save result on Elevate
    //    3.3.4) Begin step 3.3 again with next url on list
    //  3.4) Once results have been iterated through, begin step 3 with next page











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

  }
}
