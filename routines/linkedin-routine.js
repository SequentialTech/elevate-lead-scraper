export default class LinkedinRoutine {
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
      return false
    }

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
    await this.page.waitForNavigation()

    // TO DO: Handle authentication, if success return true, else return false
    // return boolean
  }

  async search() {
    // With newly created session, begin recursive search based off of config and current page
    // URL: https://www.linkedin.com/sales/search/company?
    // GET VARS:
    // companySize={COMPANY_SIZE}
    // page={PAGE_NUM}
    // companyHeadCountGrowth=(min:{MIN_GROWTH,max:100})
    // geoIncluded=90000052
    await this.page.goto(`https://www.linkedin.com/sales/search/company?companySize=${this.config.companySize}&companyHeadCountGrowth=(min:${this.config.minGrowth},max:100)&page=${this.currentPage}&geoIncluded=90000052`)

    // Parse the page
    const pageResults = this.parsePageResults()
    // Expect { data: scrapedResults, next: boolean }
    // Push results, check next variable
    // If next is true, bump page number and go to next page
    // If false, set page number back to 1 and return
  }

  async parsePageResults() {
    // Check if results are present
    // const resultNames = await this.page.$eval('.result-lockup__name > a', el => el.innerText)

    // Iterate results to pull company metadata
    // Check for next page, if present return true, if not return false
  }
}
