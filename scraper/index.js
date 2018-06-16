const phantom = require('phantom')
const axios = require('axios')
const helpers = require('../helpers')

module.exports = {
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

          // Fetch indeed results from results

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
              console.log('\nFinal search executed, exiting.')
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

  },


  runIndeed: async (config, companies) => {
      
    // 1) Initialize phantom
    const instance = await phantom.create()
    const page = await instance.createPage()
    
    // Page log -> cli
    await page.on('onConsoleMessage', function(msg, lineNum, sourceId) {
      console.log('\nWeb page logged: ' + msg)
    })
    
    // Results array
    var results = []

    // 2) Scrape each url
    companies.forEach(async (company, index) => {
      let status = await page.open(company.indeed_url)

      // If initial page loaded successfully, scrape data
      if(status === 'success'){
        console.log('\nPulling indeed data...')
        company.job_listing_count = await page.evaluate(helpers.indeed)
        results.push(company)

        // If last company, exit
        if(!companies[index + 1]){
          console.log('\nFinal scrape executed, exiting.')
          await instance.exit()
          
          // Send results back to elevate
          console.log(results)
          return true
        }
      } else{
        console.log('failed to load')
        await instance.exit()
        return false
      }
    })

  }
}
