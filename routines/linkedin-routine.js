const puppeteer = require('puppeteer')

class LinkedinRoutine {
  constructor(batchId, config) {
    this.batchId = batchId
    this.config = config

    // Puppeteer
    this.browser = null
    this.page = null

    // Scrape data/results
    this.results = []
    this.currentPage = 1
  }

  async run() {
    // Init browser
    this.browser = await puppeteer.launch({ defaultViewport: { width: 1440, height: 7000 } })
    this.page = await this.browser.newPage()
    this.page.on('console', consoleObj => console.log(consoleObj.text()))

    // Login
    const loginResult = await this.login()
    if(!loginResult) {
      // Notify Elevate of error? Bugsnag?
      console.error('linkedin login failed')
      return false
    }
    console.log('linkedin login successful')

    // Run search
    await this.search()

    // Return results
    return this.results
  }

  async login() {
    // Open Linkedin Sales Navigator login page
    await this.page.goto('https://www.linkedin.com/uas/login?fromSignIn=true&trk=navigator&session_redirect=/sales2/loginRedirect.html')

    // Fill out form, submit
    await this.page.type('#username', process.env.LINKEDIN_USERNAME)
    await this.page.type('#password', process.env.LINKEDIN_PASSWORD)
    await this.page.click('button[type="submit"]')

    // Return login success/failurre
    const response = await this.page.waitForNavigation()
    const status = response.status()
    return status === 200
  }

  async search() {
    // With newly created session, begin recursive search based off of config and current page
    const url = `https://www.linkedin.com/sales/search/company?companySize=${this.config.companySize}&companyHeadCountGrowth=(min:${this.config.minGrowth},max:100)&page=${this.currentPage}&geoIncluded=90000052`
    console.info('searching: ', url)
    await this.page.goto(url, { waitUntil: 'networkidle2' })
    await this.page.waitForTimeout(3000)

    // Parse the page
    const pageResults = this.parsePageResults()
    return true
    // Expect { data: scrapedResults, next: boolean }
    // Push results, check next variable
    // If next is true, bump page number and re-run
    // If false, set page number back to 1 and return
  }

  async parsePageResults() {
    // this.page.screenshot({ path: 'debug.js' })
    // Find results
    const results = await this.page.evaluate(sel => {
      let elements = Array.from(document.querySelectorAll(sel))

      // Parse all required info
      let data = elements.map(element => {
        try {
          // Company Name
          let companyName = element.querySelector('.result-lockup__name > a').innerText

          // Linkedin ID
          let linkedinId = element.getAttribute('data-scroll-into-view').split(':').pop()

          // Linkedin URL
          let linkedinUrl = `https://www.linkedin.com/sales/company/${linkedinId}/insights`

          // Industry
          let industry = element.querySelectorAll('li.result-lockup__misc-item')[0].innerText

          // Indeed URL (look at old code)
          // Growth Percent (need to open company page, scrape linkedinUrl)
          // Number of employees (need to open company page)

          return {
            companyName, linkedinId, linkedinUrl, industry
          }
        } catch(exception) {
          console.error(exception)
          return null
        }
      })

      return data
    }, '.search-results__result-item')
    console.log(results)

    // Check for next page, if present return true, if not return false
    const next = await this.page.evaluate(sel => {

    }, '.search-results__pagination-next-button')
    return true
  }
}

module.exports = LinkedinRoutine
