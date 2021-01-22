const puppeteer = require('puppeteer')
const { asyncForEach } = require('../helpers')

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
    this.browser = await puppeteer.launch({
      defaultViewport: { width: 1440, height: 7000 },
      args: ['--no-sandbox'],
    })
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
    const url = `https://www.linkedin.com/sales/search/company?companySize=${this.config.companySize}&companyHeadCountGrowth=(min:${this.config.minGrowth},max:500)&page=${this.currentPage}&geoIncluded=90000052`
    console.info('searching: ', url)
    await this.page.goto(url, { waitUntil: 'networkidle2' })
    await this.page.waitForTimeout(2000)

    // Parse the page results, check for next page
    const data = await this.parseSearchPageResults()

    // Add to results
    this.results.push(...data.results)

    // Re-run search if next page, otherwise return
    if(data.next) {
      this.currentPage++
      return this.search()
    } else {
      console.log(this.results)
      return true
    }
  }

  async parseSearchPageResults() {
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

          // Indeed URL
          let indeedUrl = `https://www.indeed.com/jobs?l=Georgia&q=${encodeURIComponent(companyName)}`

          return {
            companyName, linkedinId, linkedinUrl, industry, indeedUrl
          }
        } catch(exception) {
          console.error(exception)
          return null
        }
      })

      return data
    }, '.search-results__result-item')

    console.log('check for next page...')
    // Check for next page, if present return true, if not return false
    const next = await this.page.evaluate(sel => {
      let nextPage = !document.querySelector(sel).disabled
      return nextPage
    }, '.search-results__pagination-next-button')
    console.log('next page?', next)

    // Iterate results, scrape insights page for number of employees and growth percent (linkedinUrl)
    await asyncForEach(results, async (result) => {
      try {
        console.log(`looking up ${result.companyName} at ${result.linkedinUrl}`)
        await this.page.goto(result.linkedinUrl, { waitUntil: 'networkidle2' })
        await this.page.waitForTimeout(1000)

        let { growthPercent, numberOfEmployees } = await this.page.evaluate(async (sel) => {
          let element = document.querySelector(sel)

          // Toggle to year
          let growthSelect = document.querySelector('.employee-insights-filter')
          growthSelect.value = 'YEAR'
          growthSelect.dispatchEvent(new Event('change'))

          // Wait for DOM update
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Growth percent
          let growthPercent = element.querySelector('.employee-increase').innerText.replace(' ', '').trim()

          // Number of employees
          let numberOfEmployees = element.querySelectorAll('.graph-stats')[1].innerText.replace('(', '').replace(')', '').trim()

          return { growthPercent, numberOfEmployees }
        }, '.insights-employee-container')

        result.growthPercent = growthPercent
        result.numberOfEmployees = numberOfEmployees
        return true

      } catch (error) {
        result.growthPercent = 'N/A'
        result.numberOfEmployees = 'N/A'
        return false
      }
    })

    return { results, next }
  }
}

module.exports = LinkedinRoutine
