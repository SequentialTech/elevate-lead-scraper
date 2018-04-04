//const logger = require('./logger').createLogger(`logs/development.log`); // logs to a file
const phantom = require('phantom')
const helpers = require('../helpers')

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
    // Step variable (will determine function to execute)
    var step = ''

    // Results variable (holds search result urls)
    var results = []

    // Current result variable (holds result index)
    var current_result = 0

    // 1) Initialize phantom
    const instance = await phantom.create()
    const page = await instance.createPage()
    const status = await page.open(config.url)


    // 2) If initial page loaded successfully, fill out login form
    if(status === 'success'){
      console.log('Filling out login form...')
      await page.evaluate(helpers.login, config)
      step = 'searchResults'
    } else{
      console.log('failed to load')
      await instance.exit()
      return false
    }

    // 3) After successful login, on the search results page (iterating)
    //  3.1) Scan for li.result
    //  3.2) Create array of result URLs by constructing URL with id (/sales/company/{id}/insights)
    //  3.3) Navigate to result URL (iterating):
    //    3.3.1) Pull aside.insights-employee-container dl.graph-footer dd.graph-stats content (percentage growth)
    //    3.3.2) Pull aside.insights-employee-container dt.graph-footer dd.graph-stats content (company size)
    //    3.3.3) Check config windows against values, and if appropriate, save result on Elevate
    //    3.3.4) Begin step 3.3 again with next url on list
    //  3.4) Once results have been iterated through, begin step 3 with next page

    // Handle page load
    await page.on('onLoadFinished', async function(status) {
      if(status !== 'success'){
        console.error('Error loading page')
        await instance.exit()
        return false
      }
      var url = await page.property('url')
      console.log('\n')
      console.log(status, url)
      console.log('\n\n')

      // Ignore this redirect page
      if(url.indexOf('contract-chooser') !== -1) {
        console.log('Ignore page')
        return true
      }

      console.log('Page load finished, executing page evaluation')
      switch(step){
        case 'searchResults':
          console.log('Parsing search results')
          results = await page.evaluate(helpers.searchResults, config)
          await instance.exit()
          break
      }
      //var content = await page.property('content')
      //console.log(content)
    })

    // URL Change
    await page.on('onLoadStarted', function() {
      console.log('\n\n')
      console.log('Page requested')
    })

    // Page log -> cli
    await page.on('onConsoleMessage', function(msg, lineNum, sourceId) {
      console.log('\nWeb page logged: ' + msg)
    })

  }
}
