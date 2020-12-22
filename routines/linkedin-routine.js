export default class LinkedinRoutine {
  constructor(batchId, config) {
    this.batchId = batchId
    this.config = config
  }

  async run() {
    // Login
    // Run search
    // Return
  }

  async login() {
    // Open Linkedin Sales Navigator login page
    // Fill out form, submit
    // Return success
  }

  async search() {
    // With newly created session, begin recursive search based off of config and current page
    // URL: https://www.linkedin.com/sales/search/company?
    // GET VARS:
    // companySize={COMPANY_SIZE}
    // page={PAGE_NUM}
    // companyHeadCountGrowth=(min:{MIN_GROWTH,max:100})
    // geoIncluded=90000052

    // If true is returned, go to next page
    // If false is returned, return
  }

  async parsePage() {
    // Check if results are present
    // Iterate results to pull company metadata
    // Check for next page, if present return true, if not return false
  }
}
