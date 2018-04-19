//const logger = require('./logger').createLogger(`logs/development.log`); // logs to a file
const phantom = require('phantom')
const axios = require('axios')
const helpers = require('../helpers')

module.exports = {
  test: async () => {
    const instance = await phantom.create()
    const page = await instance.createPage()

    await page.property('viewportSize', { width: 1024, height: 600 })
    //const status = await page.open('http://www.polkpa.org/CamaDisplay.aspx?OutputMode=Display&SearchType=RealEstate&ParcelID=242903273002003260')
    const status = await page.open('http://www.polkpa.org/LegalDesc.aspx?strap=242903273002003260')
    console.log(`Page opened with status [${status}].`)

    await page.render('rendering.pdf')
    console.log(`File created at [./stackoverflow.pdf]`)

    await instance.exit()
  },


  run: async (config, urls) => {
    // Step variable (will determine function to execute)
    var step = ''

    // Results variable (holds search result urls)
    var results = []

    // Current result variable (holds result index)
    var current_search = 0

    // Variable to track search pages
    var start_at = 0


    // 1) Initialize phantom
    const instance = await phantom.create()
    const page = await instance.createPage()
    const status = await page.open(urls[current_search]+start_at)


    // 2) If initial page loaded successfully, fill out login form
    if(status === 'success'){
      console.log('\nFilling out login form...')
      await page.evaluate(helpers.login, config)
      step = 'searchResults'
    } else{
      console.log('failed to load')
      await instance.exit()
      return false
    }


    // 3) Handle subsequent page loads
    await page.on('onLoadFinished', async function(status) {
      if(status !== 'success'){
        console.error('\nError loading page')
        await instance.exit()
        return false
      }
      var url = await page.property('url')
      console.log(status, url)

      // Ignore this redirect page
      if(url.indexOf('contract-chooser') !== -1) {
        console.log('\nIgnore page')
        return true
      }

      console.log('\nPage load finished, executing page evaluation')
      switch(step){

        case 'searchResults':
          console.log('\nParsing search results')
          results = await page.evaluate(helpers.searchResults, config)
          console.log(results)

          // Report results to Elevate if present
          if(results.length){
            console.log('\nSending results to elevate..')
            axios.post(config.elevate+'/scrape-results', {results: results}, {
              headers: {
                'Content-type': 'application/json'
              }
            })
            .then(rsp => {
              // To Do (Log all responses?)
              console.info(rsp.data)
            })
            .catch(error => {
              // To Do (What should behavior be for failure? Simply log?)
              console.error(error)
            })
          }


          // If results are empty, proceed to next search url
          if(!results.length || results.length < 100){
            // If final search, exit!
            if(!urls[current_search + 1]){
              console.log('\Final search executed, exiting.')
              await instance.exit()
              return true
            }
            console.log('\nEmpty results or final result set, proceeding to next search')
            start_at = 0
            page.open(urls[current_search++]+start_at)
            break
          } else{
            console.log('\nNavigating to next page of results')
            start_at += 100
            page.open(urls[current_search]+start_at)
            break
          }
          break
      }
    })

    // URL Change
    await page.on('onLoadStarted', function() {
      console.log('\nPage requested')
    })

    // Page log -> cli
    await page.on('onConsoleMessage', function(msg, lineNum, sourceId) {
      console.log('\nWeb page logged: ' + msg)
    })

  }
}
