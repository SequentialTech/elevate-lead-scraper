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
    this.browser = await puppeteer.launch()
    this.page = await this.browser.newPage()

    // Login
    const loginResult = await this.login()
    if(!loginResult) {
      // Notify Elevate of error? Bugsnag?
      console.log('linkedin login failed')
      return false
    }
    console.log('linkedin login successful, searching')

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

    // Handle login success/failurre
    const response = await this.page.waitForNavigation()
    const status = response.status()
    return status === 200
  }

  async search() {
    // With newly created session, begin recursive search based off of config and current page
    // URL: https://www.linkedin.com/sales/search/company?
    // GET VARS:
    // companySize={COMPANY_SIZE}
    // page={PAGE_NUM}
    // companyHeadCountGrowth=(min:{MIN_GROWTH,max:100})
    // geoIncluded=90000052
    const url = `https://www.linkedin.com/sales/search/company?companySize=${this.config.companySize}&companyHeadCountGrowth=(min:${this.config.minGrowth},max:100)&page=${this.currentPage}&geoIncluded=90000052`
    console.log('searching: ', url)
    await this.page.goto(url, { waitUntil: 'networkidle0' })

    // Parse the page
    const pageResults = this.parsePageResults()
    return true
    // Expect { data: scrapedResults, next: boolean }
    // Push results, check next variable
    // If next is true, bump page number and go to next page
    // If false, set page number back to 1 and return
  }

  async parsePageResults() {
    // Find results
    const results = await this.page.evaluate(sel => {
      let elements = Array.from(document.querySelectorAll(sel))

      // Parse all required info
      let data = elements.map(element => {
        // Company Name
        // Linkedin ID
        // Linkedin URL
        // Number of employees (don't need to extract)
        // Industry
        // Indeed URL (look at old code)
        // Growth Percent (need to open company page)
        return {
          name: 'Test',
          linkedin_id: 1000
        }
      })

      return data

    }, '.search-results__result-item')
    console.log(results)

    // Check for next page, if present return true, if not return false
    return true
  }
}

module.exports = LinkedinRoutine
